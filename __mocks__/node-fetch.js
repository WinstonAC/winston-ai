global.fetch = jest.fn((url, options) => {
  // Mock successful response
  if (url.includes('/api/campaigns')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            id: '1',
            name: 'Test Campaign',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ]
      })
    });
  }

  // Mock error response
  if (url.includes('/api/error')) {
    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        error: 'Internal Server Error'
      })
    });
  }

  // Default mock response
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  });
}); 