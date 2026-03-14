import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

const options = [
  { label: 'All', value: '' },
  { label: 'Idea', value: 'idea' },
  { label: 'Concept', value: 'concept' },
]

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="" onChange={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Idea')).toBeInTheDocument()
    expect(screen.getByText('Concept')).toBeInTheDocument()
  })

  it('calls onChange when option is clicked', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="" onChange={onChange} />)
    fireEvent.click(screen.getByText('Idea'))
    expect(onChange).toHaveBeenCalledWith('idea')
  })

  it('highlights the active option', () => {
    render(<SegmentedControl options={options} value="idea" onChange={() => {}} />)
    const activeBtn = screen.getByText('Idea')
    expect(activeBtn.className).toMatch(/bg-white/)
  })
})
