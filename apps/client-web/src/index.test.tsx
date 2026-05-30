import { describe, expect, it, vi, beforeEach } from 'vitest'

const { renderMock, createRootMock } = vi.hoisted(() => ({
  renderMock: vi.fn(),
  createRootMock: vi.fn(() => ({ render: renderMock })),
}))

vi.mock('react-dom/client', () => ({
  default: { createRoot: createRootMock },
}))

vi.mock('./App', () => ({
  default: () => null,
}))

describe('index', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    renderMock.mockClear()
    createRootMock.mockClear()
    vi.resetModules()
  })

  it('mounts the app when #root exists', async () => {
    await import('./index')
    expect(createRootMock).toHaveBeenCalled()
    expect(renderMock).toHaveBeenCalled()
  })

  it('throws when #root is missing', async () => {
    document.body.innerHTML = ''
    await expect(import('./index')).rejects.toThrow(/root element/i)
  })
})
