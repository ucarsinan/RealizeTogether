import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Ensure DOM is fully reset between tests.
// Required when Vitest globals:true is set — auto-cleanup is not guaranteed.
afterEach(() => {
  cleanup()
})
