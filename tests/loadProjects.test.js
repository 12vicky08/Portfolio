const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('loadProjects API logic', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.innerHTML = html.toString();

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock fetch
    global.fetch = jest.fn();

    // Prevent console.error from cluttering output in failure tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules(); // allow re-requiring script.js
  });

  it('renders curated projects and fetches github repos successfully', async () => {
    const mockRepos = [
      {
        name: 'test-repo-1',
        description: 'Test description 1',
        html_url: 'https://github.com/12vicky08/test-repo-1',
        language: 'JavaScript',
        topics: ['react', 'testing']
      },
      {
        name: 'test-repo-2',
        description: null,
        html_url: 'https://github.com/12vicky08/test-repo-2',
        language: null,
        topics: []
      },
      {
        // Should be skipped because it's in HIDDEN_REPOS ('portfolio')
        name: 'portfolio',
        description: 'Portfolio source',
        html_url: 'https://github.com/12vicky08/portfolio',
        language: 'HTML',
        topics: []
      },
      {
        // Should be skipped because it's a curated project URL
        name: 'dSA',
        description: 'Java swing net duel',
        html_url: 'https://github.com/12vicky08/dsa',
        language: 'Java',
        topics: []
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos
    });

    // Load script
    require('../script.js');

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 0)); // additional tick just in case

    const container = document.getElementById('projects-container');
    const cards = container.querySelectorAll('.project-card');

    // Expected: 5 curated projects + 2 fetched = 7 cards
    expect(cards.length).toBe(7);

    // Verify loading indicator is removed
    expect(document.getElementById('projects-loading')).toBeNull();

    // Verify first card is a curated one
    expect(cards[0].querySelector('h3').textContent).toBe('Net Duel — Puzzle Game');

    // Verify fetched cards
    const fetchedCard1 = cards[5];
    expect(fetchedCard1.querySelector('h3').textContent).toBe('Test Repo 1');
    expect(fetchedCard1.querySelector('p').textContent).toBe('Test description 1');
    const tags1 = Array.from(fetchedCard1.querySelectorAll('.project-tags span')).map(s => s.textContent);
    expect(tags1).toEqual(['JavaScript', 'react', 'testing']);

    const fetchedCard2 = cards[6];
    expect(fetchedCard2.querySelector('h3').textContent).toBe('Test Repo 2');
    expect(fetchedCard2.querySelector('p').textContent).toBe('No description available.');

    // Verify projects stat counter is updated
    const statCards = document.querySelectorAll('.stat');
    let projectStatUpdated = false;
    statCards.forEach(stat => {
        const label = stat.querySelector('.stat-label');
        if (label && label.textContent.trim() === 'Projects') {
            const number = stat.querySelector('.stat-number');
            if (number && number.textContent === '7' && number.dataset.count === '7') {
                projectStatUpdated = true;
            }
        }
    });
    expect(projectStatUpdated).toBe(true);
  });

  it('renders curated projects even if GitHub API responds with not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    require('../script.js');

    await new Promise(resolve => setTimeout(resolve, 0));

    const container = document.getElementById('projects-container');
    const cards = container.querySelectorAll('.project-card');

    // Should only have 5 curated projects
    expect(cards.length).toBe(5);

    const statCards = document.querySelectorAll('.stat');
    let projectStatUpdated = false;
    statCards.forEach(stat => {
        const label = stat.querySelector('.stat-label');
        if (label && label.textContent.trim() === 'Projects') {
            const number = stat.querySelector('.stat-number');
            if (number && number.textContent === '5' && number.dataset.count === '5') {
                projectStatUpdated = true;
            }
        }
    });
    expect(projectStatUpdated).toBe(true);
  });

  it('handles network failures gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    require('../script.js');

    await new Promise(resolve => setTimeout(resolve, 0));

    const container = document.getElementById('projects-container');
    const cards = container.querySelectorAll('.project-card');

    // Should only have 5 curated projects
    expect(cards.length).toBe(5);

    // console.error should have been called
    expect(console.error).toHaveBeenCalledWith('Failed to fetch GitHub repos:', expect.any(Error));

    const statCards = document.querySelectorAll('.stat');
    let projectStatUpdated = false;
    statCards.forEach(stat => {
        const label = stat.querySelector('.stat-label');
        if (label && label.textContent.trim() === 'Projects') {
            const number = stat.querySelector('.stat-number');
            if (number && number.textContent === '5' && number.dataset.count === '5') {
                projectStatUpdated = true;
            }
        }
    });
    expect(projectStatUpdated).toBe(true);
  });
});
