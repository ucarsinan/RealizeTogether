# DECISIONS.md — Architecture & Workflow Decisions

> This file documents significant decisions about architecture, tooling, and workflow.
> Record a decision here when:
> - It affects how the project is structured or deployed
> - It is non-obvious why a particular approach was chosen
> - A future agent or developer might otherwise change it without understanding the reason
> - A meaningful tradeoff was made
>
> Do NOT document every minor implementation detail here — only decisions with lasting consequences.

---

## Format (ADR — Architecture Decision Record)

```markdown
## ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Deprecated | Superseded by ADR-YYY
**Decided by:** human / Claude Code / Codex / Gemini + human confirmation

### Context
What situation or problem triggered this decision?

### Decision
What was decided?

### Rationale
Why this approach over alternatives?

### Consequences
What becomes easier or harder as a result?

### Alternatives considered
What else was considered and why rejected?
```

---

## ADR-000: Shared AI Repository State

**Date:** 2026-05-10
**Status:** Accepted
**Decided by:** human

### Context
Multiple AI agents (Claude Code, Codex, Gemini) work on the same codebase across different sessions. Each agent has independent context windows and no memory of previous sessions. Without a shared, version-controlled state, knowledge is lost between sessions and agents make conflicting decisions.

### Decision
This project uses the following files as the shared, authoritative AI state:

- `AGENTS.md` — universal rules for all agents
- `CLAUDE.md` — Claude Code adapter
- `GEMINI.md` — Gemini adapter
- `docs/ai/PROJECT.md` — permanent project context
- `docs/ai/CURRENT.md` — live working state
- `docs/ai/TASKS.md` — task board
- `docs/ai/DECISIONS.md` — this file (ADR log)
- `docs/ai/HANDOFF.md` — agent-to-agent handoff
- `docs/ai/CODE_REVIEW.md` — review rules
- `docs/ai/WORKFLOW.md` — daily workflow

### Rationale
Chat histories are not portable. They cannot be shared between tools, are lost when context windows fill, and cannot be reviewed or amended by humans. Repository files are version-controlled, durable, human-readable, and accessible by any agent.

### Consequences
- Every agent must read the AI state files before starting significant work.
- Every agent must update `CURRENT.md`, `TASKS.md`, and `HANDOFF.md` before ending a session.
- Humans must commit these files to Git regularly.
- The overhead is small compared to the benefit of reliable cross-agent continuity.

### Alternatives considered
- Relying on chat history: not portable, not version-controlled, lost on context window exhaustion.
- Using a separate database or API: adds infrastructure complexity, requires internet access, not universally available.

---

## ADR-001: Server Actions → Supabase Directly (No API Layer for CRUD)

**Date:** 2026-05-10
**Status:** Accepted
**Decided by:** Sinan Uçar (human)

### Context

The platform needs data access patterns for profiles, projects, NDAs, applications, conversations, and matching. Two common approaches: (1) Server Actions calling Supabase directly, (2) Server Actions calling an internal REST/tRPC API layer that calls Supabase.

### Decision

Server Actions call Supabase directly. No intermediate API layer for CRUD operations. FastAPI is reserved exclusively for AI features and the matching algorithm.

### Rationale

- Reduces roundtrip latency (no extra network hop)
- Fewer moving parts: no API routes to maintain for standard CRUD
- Supabase Row Level Security handles data access control at the DB level
- FastAPI is only justified for CPU-heavy / Python-specific work (AI, ML)

### Consequences

- All CRUD logic lives in `src/actions/*.ts` — consistent location
- RLS must be configured for every table — non-negotiable requirement
- FastAPI must never be used for CRUD — only AI and matching
- Any future caching must be implemented at the Server Action level

### Alternatives considered

- tRPC: adds type-safe API layer but doubles the code for standard CRUD
- REST API routes: consistent with REST conventions but unnecessary for this scale
- GraphQL: overkill for the current feature set
