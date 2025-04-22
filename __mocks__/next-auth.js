const mockSession = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg'
  },
  expires: new Date(Date.now() + 3600 * 1000).toISOString()
};

const mockUseSession = () => ({
  data: mockSession,
  status: 'authenticated'
});

const mockGetSession = () => Promise.resolve(mockSession);

const mockSignIn = () => Promise.resolve({ ok: true });

const mockSignOut = () => Promise.resolve({ ok: true });

module.exports = {
  useSession: mockUseSession,
  getSession: mockGetSession,
  signIn: mockSignIn,
  signOut: mockSignOut
}; 