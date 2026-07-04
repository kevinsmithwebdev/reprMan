import { vi } from 'vitest'

export const navigationMocks = {
  pathname: '/',
  params: {} as Record<string, string>,
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}

export const setMockPathname = (pathname: string) => {
  navigationMocks.pathname = pathname
}

export const setMockParams = (params: Record<string, string>) => {
  navigationMocks.params = params
}

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    useRouter: () => ({
      push: navigationMocks.push,
      replace: navigationMocks.replace,
      back: navigationMocks.back,
    }),
    usePathname: () => navigationMocks.pathname,
    useParams: () => navigationMocks.params,
  }
})
