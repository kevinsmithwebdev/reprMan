import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Bridge legacy `jest.*` references in pre-existing test files to vitest's `vi`.
// Lets us migrate without rewriting every `jest.useFakeTimers()` / `jest.spyOn()`.
const globalRef = globalThis as unknown as { jest: typeof vi }
globalRef.jest = vi
