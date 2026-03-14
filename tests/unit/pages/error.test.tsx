import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '@/app/error'

describe('GlobalError Page', () => {
  it('renders error message', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('Test error')} reset={reset} />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders try again button', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('Test error')} reset={reset} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls reset when try again is clicked', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('Test error')} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('shows fallback message when no error message', () => {
    const reset = vi.fn()
    const error = new Error('')
    render(<GlobalError error={error} reset={reset} />)
    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument()
  })
})
