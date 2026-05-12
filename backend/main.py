import os
import math
import json
import logging
from typing import Literal
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://realize-together.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled exception", exc_info=exc)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_KEY"],
    )


def parse_embedding(raw) -> list[float] | None:
    """pgvector columns come back as string '[0.1,0.2,...]' from Supabase REST."""
    if raw is None:
        return None
    if isinstance(raw, list):
        return [float(x) for x in raw]
    if isinstance(raw, str):
        return [float(x) for x in json.loads(raw)]
    return None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


# ---------------------------------------------------------------------------
# /api/extract-skills  — Magic Wand: extract skills from bio
# ---------------------------------------------------------------------------

class ExtractSkillsRequest(BaseModel):
    bio: str = Field(..., min_length=1, max_length=2000)


@app.post("/api/extract-skills")
async def extract_skills(request: ExtractSkillsRequest):
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract professional skills from the bio. "
                    "Return JSON: { \"skills\": [\"Skill 1\", \"Skill 2\", ...] }. "
                    "Max 10 skills, short labels (1-3 words), English only. "
                    "No explanation, only JSON."
                ),
            },
            {"role": "user", "content": request.bio},
        ],
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)
    skills = data.get("skills", [])
    if not isinstance(skills, list):
        skills = []
    return {"skills": [str(s) for s in skills[:10]]}


# ---------------------------------------------------------------------------
# /ai/generate-embedding  — fire-and-forget embedding generation
# ---------------------------------------------------------------------------

class GenerateEmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    type: Literal["skills", "role"]


@app.post("/ai/generate-embedding")
async def generate_embedding(request: GenerateEmbeddingRequest):
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=request.text,
    )
    return {"embedding": response.data[0].embedding}


# ---------------------------------------------------------------------------
# /ai/match-projects  — recommended projects for a talent
# ---------------------------------------------------------------------------

@app.get("/ai/match-projects")
async def match_projects(user_id: str):
    supabase = get_supabase()

    profile_res = (
        supabase.table("profiles")
        .select("skills_embedding")
        .eq("id", user_id)
        .single()
        .execute()
    )
    skills_embedding = parse_embedding(profile_res.data.get("skills_embedding"))
    if not skills_embedding:
        return {"matches": []}

    # Derive user's preferred category / commitment / stage from past applications
    apps_res = (
        supabase.table("project_applications")
        .select("projects(category, commitment_type, stage)")
        .eq("user_id", user_id)
        .execute()
    )
    categories: list[str] = []
    commitments: list[str] = []
    stages: list[str] = []
    for row in apps_res.data or []:
        p = row.get("projects") or {}
        if p.get("category"):
            categories.append(p["category"])
        if p.get("commitment_type"):
            commitments.append(p["commitment_type"])
        if p.get("stage"):
            stages.append(p["stage"])

    fav_category = max(set(categories), key=categories.count) if categories else None
    fav_commitment = max(set(commitments), key=commitments.count) if commitments else None
    fav_stage = max(set(stages), key=stages.count) if stages else None

    # Fetch open project roles that have an embedding
    roles_res = (
        supabase.table("project_roles")
        .select("id, role_name, project_id, role_embedding, projects(id, status, category, commitment_type, stage)")
        .not_.is_("role_embedding", "null")
        .execute()
    )

    scored = []
    for role in roles_res.data or []:
        project = role.get("projects") or {}
        if project.get("status") != "open":
            continue
        role_emb = parse_embedding(role.get("role_embedding"))
        if not role_emb:
            continue

        sim = cosine_similarity(skills_embedding, role_emb)
        cat_boost = 1.0 if fav_category and project.get("category") == fav_category else 0.0
        commit_boost = 1.0 if fav_commitment and project.get("commitment_type") == fav_commitment else 0.0
        stage_boost = 1.0 if fav_stage and project.get("stage") == fav_stage else 0.0

        final_score = sim * 0.70 + cat_boost * 0.15 + commit_boost * 0.10 + stage_boost * 0.05
        scored.append(
            {
                "project_id": role["project_id"],
                "role_id": role["id"],
                "role_name": role["role_name"],
                "score": round(final_score, 4),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"matches": scored[:5]}


# ---------------------------------------------------------------------------
# /ai/match-talents  — recommended talents for a project creator
# ---------------------------------------------------------------------------

@app.get("/ai/match-talents")
async def match_talents(project_id: str):
    supabase = get_supabase()

    roles_res = (
        supabase.table("project_roles")
        .select("id, role_name, role_embedding")
        .eq("project_id", project_id)
        .not_.is_("role_embedding", "null")
        .execute()
    )
    roles = roles_res.data or []
    if not roles:
        return {"matches": []}

    parsed_roles = []
    for r in roles:
        emb = parse_embedding(r.get("role_embedding"))
        if emb:
            parsed_roles.append({"role_name": r["role_name"], "embedding": emb})
    if not parsed_roles:
        return {"matches": []}

    profiles_res = (
        supabase.table("profiles")
        .select("id, skills_embedding")
        .not_.is_("skills_embedding", "null")
        .execute()
    )
    profiles = profiles_res.data or []
    if not profiles:
        return {"matches": []}

    # Best role match per talent
    talent_best: dict[str, dict] = {}
    for profile in profiles:
        user_emb = parse_embedding(profile.get("skills_embedding"))
        if not user_emb:
            continue
        best_score = 0.0
        best_role = ""
        for role in parsed_roles:
            sim = cosine_similarity(user_emb, role["embedding"])
            if sim > best_score:
                best_score = sim
                best_role = role["role_name"]
        if best_score > 0:
            talent_best[profile["id"]] = {
                "user_id": profile["id"],
                "score": round(best_score, 4),
                "matched_role": best_role,
            }

    results = sorted(talent_best.values(), key=lambda x: x["score"], reverse=True)
    return {"matches": results[:5]}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "service": "Realize Together AI"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
