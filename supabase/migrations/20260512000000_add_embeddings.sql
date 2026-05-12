-- Enable pgvector extension for embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Store talent skill embeddings (text-embedding-3-small = 1536 dimensions)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_embedding vector(1536);

-- Store role embeddings for project roles
ALTER TABLE project_roles ADD COLUMN IF NOT EXISTS role_embedding vector(1536);
