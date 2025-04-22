const mockRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  isFallback: false
};

const useRouter = () => mockRouter;

module.exports = {
  useRouter,
  router: mockRouter
};

export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams(); 