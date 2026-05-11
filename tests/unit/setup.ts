import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Next.js headers to support testing server actions
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    get: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  })),
}))

// Ensure DOM is fully reset between tests.
// Required when Vitest globals:true is set — auto-cleanup is not guaranteed.
afterEach(() => {
  cleanup()
})
