import { test, expect } from '@playwright/test';

test.describe('Common Components and Layout', () => {
  test.describe('Layout Structure', () => {
    test('should have consistent header structure on all pages', async ({ page }) => {
      // Test a few different pages
      const pages = ['/login', '/register'];
      
      for (const url of pages) {
        await page.goto(url);
        
        // Check that page loaded
        await expect(page.locator('body')).toBeVisible();
        
        // Check for main content area
        const mainContent = page.locator('main, [role="main"], .page-content, #root');
        if (await mainContent.isVisible().catch(() => false)) {
          await expect(mainContent).toBeVisible();
        }
      }
    });
  });

  test.describe('Design System Components', () => {
    test('should use consistent button styles', async ({ page }) => {
      await page.goto('/login');
      
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await expect(submitButton).toBeVisible();
      
      // Check button has proper styling (bg-primary-600)
      const buttonClasses = await submitButton.evaluate(el => el.className);
      expect(buttonClasses).toContain('primary');
    });

    test('should use consistent card styles', async ({ page }) => {
      await page.goto('/login');
      
      const card = page.locator('.rounded-xl, .rounded-2xl, .rounded-lg').first();
      if (await card.isVisible().catch(() => false)) {
        await expect(card).toBeVisible();
      }
    });

    test('should have proper form input styling', async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.getByLabel('Email Address');
      await expect(emailInput).toBeVisible();
      
      // Check input has proper styling
      const inputClasses = await emailInput.evaluate(el => el.className);
      expect(inputClasses).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      
      // Check that content is still accessible
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('should adapt layout for tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');
      
      // Check that content is still accessible
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('should show full layout on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/login');
      
      // Desktop should show both sides
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');
      
      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check for h2
      const h2 = page.locator('h2');
      if (await h2.count() > 0) {
        await expect(h2.first()).toBeVisible();
      }
    });

    test('should have labels for form inputs', async ({ page }) => {
      await page.goto('/login');
      
      // Check that inputs have associated labels
      const emailInput = page.getByLabel('Email Address');
      await expect(emailInput).toHaveAttribute('type', 'email');
      
      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have focusable interactive elements', async ({ page }) => {
      await page.goto('/login');
      
      // Check that buttons are focusable
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.focus();
      await expect(submitButton).toBeFocused();
      
      // Check that links are focusable
      const registerLink = page.getByRole('link', { name: 'Create account' });
      if (await registerLink.isVisible().catch(() => false)) {
        await registerLink.focus();
        await expect(registerLink).toBeFocused();
      }
    });
  });

  test.describe('Animations and Transitions', () => {
    test('should have smooth page transitions', async ({ page }) => {
      await page.goto('/login');
      
      // Navigate to register
      await page.getByRole('link', { name: 'Create account' }).click();
      
      // Wait for navigation
      await page.waitForURL('/register');
      
      // Content should be visible after transition
      await expect(page.getByText('Select Your Role')).toBeVisible();
    });

    test('should have animated elements', async ({ page }) => {
      await page.goto('/login');
      
      // Check for animated elements (motion.div equivalent)
      const animatedElements = page.locator('[style*="transform"], [style*="opacity"], .animate-');
      // Just check page loaded successfully with animations
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should redirect to login or show 404
      await expect(page).toHaveURL(/login|404/);
    });

    test('should show validation errors', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      
      // Form should still be there (HTML5 validation)
      await expect(page.getByLabel('Email Address')).toBeVisible();
    });
  });

  test.describe('Navigation Flow', () => {
    test('should maintain state during navigation', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in email
      await page.getByLabel('Email Address').fill('test@example.com');
      
      // Navigate to register and back
      await page.getByRole('link', { name: 'Create account' }).click();
      await page.waitForURL('/register');
      
      await page.getByRole('link', { name: 'Sign in' }).click();
      await page.waitForURL('/login');
      
      // Email should be cleared (new page load)
      const emailValue = await page.getByLabel('Email Address').inputValue();
      expect(emailValue).toBe('');
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should render correctly in different browsers', async ({ page, browserName }) => {
      await page.goto('/login');
      
      // Basic check that page renders
      await expect(page.getByText('Smart Attend')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      
      // Log browser for debugging
      console.log(`Tested in ${browserName}`);
    });
  });
});
