import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('NotFound Page', () => {
  it('renders 404 kicker', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders page not found headline', () => {
    render(<NotFound />)
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('renders link to explore', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /browse projects/i })
    expect(link).toHaveAttribute('href', '/explore')
  })
})
