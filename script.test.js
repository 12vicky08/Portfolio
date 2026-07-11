const fs = require('fs');
const path = require('path');

describe('renderProjectCard', () => {
    let renderProjectCard;
    let container;

    beforeAll(() => {
        // Load the HTML so the script can find elements if needed
        const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
        document.documentElement.innerHTML = html;

        // Mock browser APIs used globally in script.js
        global.IntersectionObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
        global.performance = { now: jest.fn(() => 0) };
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
        }));

        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));

        // Require the script module
        const script = require('./script.js');
        renderProjectCard = script.renderProjectCard;
    });

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'projects-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        jest.clearAllMocks();
    });

    it('creates an article element with correct classes', () => {
        const project = {
            name: 'Test Project',
            description: 'Test Description',
            tags: [],
            url: 'http://test.com'
        };

        renderProjectCard(container, project, 0);

        const card = container.firstElementChild;
        expect(card.tagName).toBe('ARTICLE');
        expect(card.classList.contains('project-card')).toBe(true);
        expect(card.classList.contains('reveal')).toBe(true);
    });

    it('calculates transition delay correctly based on index', () => {
        const project = { name: 'Test', description: 'Test', tags: [], url: 'http://test.com' };

        renderProjectCard(container, project, 0); // index 0
        renderProjectCard(container, project, 1); // index 1
        renderProjectCard(container, project, 2); // index 2

        const cards = container.children;

        // Use parseFloat and toBeCloseTo to avoid floating point precision issues
        expect(parseFloat(cards[0].style.transitionDelay)).toBeCloseTo(0.05);
        expect(parseFloat(cards[1].style.transitionDelay)).toBeCloseTo(0.12);
        expect(parseFloat(cards[2].style.transitionDelay)).toBeCloseTo(0.19);
    });

    it('renders project details correctly', () => {
        const project = {
            name: 'My Cool Project',
            description: 'This is a description.',
            tags: ['JavaScript', 'Jest'],
            url: 'https://github.com/cool-project'
        };

        renderProjectCard(container, project, 0);

        const card = container.firstElementChild;

        // Name
        const title = card.querySelector('h3');
        expect(title.textContent).toBe('My Cool Project');

        // Description
        const desc = card.querySelector('p');
        expect(desc.textContent).toBe('This is a description.');

        // Tags
        const tagElements = card.querySelectorAll('.project-tags span');
        expect(tagElements.length).toBe(2);
        expect(tagElements[0].textContent).toBe('JavaScript');
        expect(tagElements[1].textContent).toBe('Jest');

        // URL
        const link = card.querySelector('a.project-execute-btn');
        expect(link.getAttribute('href')).toBe('https://github.com/cool-project');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('handles empty tags array', () => {
        const project = {
            name: 'No Tags Project',
            description: 'No tags here',
            tags: [],
            url: 'http://test.com'
        };

        renderProjectCard(container, project, 0);

        const card = container.firstElementChild;
        const tagElements = card.querySelectorAll('.project-tags span');
        expect(tagElements.length).toBe(0);
    });
});
