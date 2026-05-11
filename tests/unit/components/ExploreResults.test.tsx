import { describe, it, expect } from 'vitest'
import { filterProjects } from '@/components/projects/ExploreResults'
import type { ProjectWithRoles } from '@/lib/types'

const makeProject = (overrides: Partial<ProjectWithRoles> = {}): ProjectWithRoles => ({
  id: 'proj-1',
  creator_id: 'user-1',
  title: 'Dark Horizon',
  logline: 'A fisherman discovers an ancient secret.',
  description: 'Full description here.',
  category: 'film',
  stage: 'concept',
  commitment_type: 'serious',
  collab_type: 'revenue_share',
  requires_nda: false,
  synopsis_url: null,
  status: 'open',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  project_roles: [
    { id: 'role-1', project_id: 'proj-1', role_name: 'Director of Photography', quantity: 1, description: null },
  ],
  profiles: {
    id: 'user-1',
    full_name: 'Jane Doe',
    avatar_url: null,
    is_verified: false,
    video_url: null,
  },
  ...overrides,
})

describe('filterProjects — text search', () => {
  it('returns all projects when search is empty', () => {
    const projects = [makeProject(), makeProject({ id: 'proj-2', title: 'Other Film' })]
    expect(filterProjects(projects, '', '')).toHaveLength(2)
  })

  it('matches by title (case-insensitive)', () => {
    const projects = [makeProject({ title: 'Dark Horizon' }), makeProject({ id: 'proj-2', title: 'Bright Future' })]
    expect(filterProjects(projects, 'dark', '')).toHaveLength(1)
    expect(filterProjects(projects, 'dark', '')[0].title).toBe('Dark Horizon')
  })

  it('matches by logline (case-insensitive)', () => {
    const projects = [
      makeProject({ logline: 'A fisherman discovers an ancient secret.' }),
      makeProject({ id: 'proj-2', logline: 'A robot falls in love.' }),
    ]
    expect(filterProjects(projects, 'fisherman', '')).toHaveLength(1)
  })

  it('returns empty array when nothing matches', () => {
    const projects = [makeProject({ title: 'Dark Horizon', logline: 'A fisherman story.' })]
    expect(filterProjects(projects, 'zombie', '')).toHaveLength(0)
  })

  it('handles null logline without crashing', () => {
    const projects = [makeProject({ title: 'Dark Horizon', logline: null })]
    expect(filterProjects(projects, 'horizon', '')).toHaveLength(1)
  })
})

describe('filterProjects — role filter', () => {
  it('returns all projects when role is empty', () => {
    const projects = [makeProject(), makeProject({ id: 'proj-2', title: 'Other' })]
    expect(filterProjects(projects, '', '')).toHaveLength(2)
  })

  it('matches partial role name (case-insensitive)', () => {
    const projects = [
      makeProject({
        project_roles: [{ id: 'r1', project_id: 'proj-1', role_name: 'Director of Photography', quantity: 1, description: null }],
      }),
      makeProject({
        id: 'proj-2',
        title: 'Other',
        project_roles: [{ id: 'r2', project_id: 'proj-2', role_name: 'Sound Designer', quantity: 1, description: null }],
      }),
    ]
    expect(filterProjects(projects, '', 'photography')).toHaveLength(1)
    expect(filterProjects(projects, '', 'photography')[0].title).toBe('Dark Horizon')
  })

  it('matches project if any of its roles matches', () => {
    const projects = [
      makeProject({
        project_roles: [
          { id: 'r1', project_id: 'proj-1', role_name: 'Director', quantity: 1, description: null },
          { id: 'r2', project_id: 'proj-1', role_name: 'Editor', quantity: 1, description: null },
        ],
      }),
    ]
    expect(filterProjects(projects, '', 'editor')).toHaveLength(1)
  })

  it('returns empty when no role matches', () => {
    const projects = [makeProject()]
    expect(filterProjects(projects, '', 'actor')).toHaveLength(0)
  })
})

describe('filterProjects — combined', () => {
  it('applies both text and role filter simultaneously', () => {
    const projects = [
      makeProject({ title: 'Dark Horizon', project_roles: [{ id: 'r1', project_id: 'proj-1', role_name: 'Editor', quantity: 1, description: null }] }),
      makeProject({ id: 'proj-2', title: 'Dark Night', project_roles: [{ id: 'r2', project_id: 'proj-2', role_name: 'Director', quantity: 1, description: null }] }),
    ]
    // matches title 'dark' → both; then role 'editor' → only proj-1
    expect(filterProjects(projects, 'dark', 'editor')).toHaveLength(1)
    expect(filterProjects(projects, 'dark', 'editor')[0].title).toBe('Dark Horizon')
  })
})
