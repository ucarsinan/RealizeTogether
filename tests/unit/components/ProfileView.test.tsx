import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileView } from '@/components/profile/ProfileView'
import type { Profile } from '@/lib/types'

const baseProfile: Profile = {
  id: 'user-1',
  full_name: 'Jane Doe',
  bio: null,
  avatar_url: null,
  video_url: null,
  portfolio_url: null,
  imdb_url: null,
  vimeo_url: null,
  linkedin_url: null,
  is_verified: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  verification_type: null,
  verified_at: null,
  role: null,
  skills: null,
}

describe('ProfileView — Skills card', () => {
  it('does not render skills card when skills is undefined', () => {
    const { skills: _skills, ...profileWithoutSkills } = baseProfile
    render(<ProfileView profile={profileWithoutSkills as Profile} isOwner={false} />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('does not render skills card when skills is null', () => {
    render(<ProfileView profile={{ ...baseProfile, skills: null }} isOwner={false} />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('does not render skills card when skills array is empty', () => {
    render(<ProfileView profile={{ ...baseProfile, skills: [] }} isOwner={false} />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('renders skills card with chip for each skill', () => {
    render(
      <ProfileView
        profile={{ ...baseProfile, skills: ['Directing', 'Screenwriting', 'Final Cut Pro'] }}
        isOwner={false}
      />
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Directing')).toBeInTheDocument()
    expect(screen.getByText('Screenwriting')).toBeInTheDocument()
    expect(screen.getByText('Final Cut Pro')).toBeInTheDocument()
  })

  it('renders skills card when user is owner', () => {
    render(
      <ProfileView
        profile={{ ...baseProfile, skills: ['Directing'] }}
        isOwner={true}
      />
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Directing')).toBeInTheDocument()
  })
})
