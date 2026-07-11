describe('Portfolio Script', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="projects-container"></div>
      <div class="stat"><div class="stat-number" data-count="0">0</div><div class="stat-label">Projects</div></div>
      <div id="navbar"></div>
      <div id="menu-toggle"></div>
      <div id="nav-links"></div>
      <div class="hero-bg"></div>
    `;

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback, options) {}
      observe(element) {}
      unobserve(element) {}
      disconnect() {}
    };

    jest.resetModules();
  });

  it('logs an error when fetching GitHub repos fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API failure'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    require('./script.js');

    // Wait for the async loadProjects to finish
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch GitHub repos:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
