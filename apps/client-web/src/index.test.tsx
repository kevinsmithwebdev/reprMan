import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const {
  renderMock,
  createRootMock,
  configureAmplifyMock,
  configureReprsApiMock,
  setClientConfigMock,
} = vi.hoisted(() => ({
  renderMock: vi.fn(),
  createRootMock: vi.fn(() => ({ render: renderMock })),
  configureAmplifyMock: vi.fn(),
  configureReprsApiMock: vi.fn(),
  setClientConfigMock: vi.fn(),
}))

vi.mock('react-dom/client', () => ({
  default: { createRoot: createRootMock },
}))

vi.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}))
vi.mock('./index.css', () => ({}))

vi.mock('./App', () => ({
  default: () => null,
}))

vi.mock('./LogBuildInfoOnMount', () => ({
  LogBuildInfoOnMount: () => null,
}))

vi.mock('@reprman/client-config', () => ({
  createWebClientConfig: vi.fn(() => ({})),
  setClientConfig: setClientConfigMock,
}))

vi.mock('@reprman/reprs-api', () => ({
  configureReprsApi: configureReprsApiMock,
}))

vi.mock('@reprman/cognito-auth', () => ({
  CognitoAuthProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  configureAmplify: configureAmplifyMock,
}))

vi.mock('@reprman/state/store', () => ({
  default: {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({})),
    subscribe: vi.fn(),
    replaceReducer: vi.fn(),
  },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe('index', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    renderMock.mockClear()
    createRootMock.mockClear()
    configureAmplifyMock.mockClear()
    configureReprsApiMock.mockClear()
    setClientConfigMock.mockClear()
  })

  it('mounts the app when #root exists', async () => {
    await import('./index')
    expect(createRootMock).toHaveBeenCalled()
    expect(renderMock).toHaveBeenCalled()
    expect(setClientConfigMock).toHaveBeenCalled()
    expect(configureReprsApiMock).toHaveBeenCalled()
    expect(configureAmplifyMock).toHaveBeenCalled()
  })

  it('throws when #root is missing', async () => {
    vi.resetModules()
    document.body.innerHTML = ''
    await expect(import('./index')).rejects.toThrow(/root element/i)
  })
})
