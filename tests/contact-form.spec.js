const { test, expect } = require('@playwright/test');

test.describe('Contact Form Submissions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the local server
    await page.goto('/');

    // Ensure smooth scrolling is disabled to prevent issues
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

    // Scroll to contact form so it's visible
    await page.locator('#contact-form').scrollIntoViewIfNeeded();
  });

  test('should display "Sent! ✓" on successful submission', async ({ page }) => {
    // Mock the Formspree endpoint to return a success response
    await page.route('https://formspree.io/f/mjgedjvw', async route => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    // Fill out the form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'This is a test message.');

    // Submit the form
    await page.click('#contact-form button[type="submit"]');

    // Wait for the button text to change
    const buttonSpan = page.locator('#contact-form button[type="submit"] span');
    await expect(buttonSpan).toHaveText('Sent! ✓');
  });

  test('should display specific error message on server error response', async ({ page }) => {
    // Mock the Formspree endpoint to return a specific error
    await page.route('https://formspree.io/f/mjgedjvw', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            { message: 'Invalid email address' }
          ]
        })
      });
    });

    // Fill out the form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#message', 'This is a test message.');

    // Submit the form
    await page.click('#contact-form button[type="submit"]');

    // Wait for the button text to change to the error message
    const buttonSpan = page.locator('#contact-form button[type="submit"] span');
    await expect(buttonSpan).toHaveText('Invalid email address');
  });

  test('should display "Error! ✗" on network failure or fetch rejection', async ({ page }) => {
    // Abort the route to simulate a network failure / fetch rejection
    await page.route('https://formspree.io/f/mjgedjvw', async route => {
      await route.abort('failed');
    });

    // Fill out the form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'This is a test message.');

    // Submit the form
    await page.click('#contact-form button[type="submit"]');

    // Wait for the button text to change to the generic error message
    const buttonSpan = page.locator('#contact-form button[type="submit"] span');
    await expect(buttonSpan).toHaveText('Error! ✗');
  });
});
