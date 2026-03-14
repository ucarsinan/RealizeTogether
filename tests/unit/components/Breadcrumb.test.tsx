import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

describe('Breadcrumb', () => {
  it('renders single item without link', () => {
    render(<Breadcrumb items={[{ label: 'Explore' }]} />)
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders parent items as links', () => {
    render(<Breadcrumb items={[
      { label: 'Explore', href: '/explore' },
      { label: 'My Project' }
    ]} />)
    const link = screen.getByRole('link', { name: 'Explore' })
    expect(link).toHaveAttribute('href', '/explore')
    expect(screen.getByText('My Project').tagName).toBe('SPAN')
  })

  it('renders separator between items', () => {
    render(<Breadcrumb items={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Profile' }
    ]} />)
    expect(screen.getByText('/')).toBeInTheDocument()
  })
})
