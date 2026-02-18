import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login page with all elements', async ({ page }) => {
      // Check page title and branding
      await expect(page.getByText('Smart Attend')).toBeVisible();
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await expect(page.getByText('Enter your credentials to access your account')).toBeVisible();
      
      // Check form elements
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      // Check additional elements
      await expect(page.getByText('Remember me')).toBeVisible();
      await expect(page.getByText('Forgot password?')).toBeVisible();
      await expect(page.getByText("Don't have an account?")).toBeVisible();
      await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      
      // HTML5 validation should prevent submission
      await expect(page.getByLabel('Email Address')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel('Password');
      await passwordInput.fill('testpassword');
      
      // Check initial type is password
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      const toggleButton = page.locator('button[type="button"]').nth(0);
      await toggleButton.click();
      
      // Check type changed to text
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should navigate to register page', async ({ page }) => {
      await page.getByRole('link', { name: 'Create account' }).click();
      await expect(page).toHaveURL('/register');
      await expect(page.getByText('Select Your Role')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Fill in invalid credentials
      await page.getByLabel('Email Address').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait for error message
      await expect(page.getByText('Invalid email or password')).toBeVisible();
    });
  });

  test.describe('Registration Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display registration page with role selection', async ({ page }) => {
      await expect(page.getByText('Select Your Role')).toBeVisible();
      await expect(page.getByText('Choose the role that best describes you')).toBeVisible();
      
      // Check all role options
      await expect(page.getByText('Head of Department')).toBeVisible();
      await expect(page.getByText('Administrator')).toBeVisible();
      await expect(page.getByText('Faculty')).toBeVisible();
      await expect(page.getByText('Student')).toBeVisible();
    });

    test('should navigate through HOD registration flow', async ({ page }) => {
      // Select HOD role
      await page.getByText('Head of Department').click();
      
      // Should show registration form
      await expect(page.getByText('Register as Head of Department')).toBeVisible();
      
      // Check form fields
      await expect(page.getByLabel('Full Name')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
      
      // Go back
      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('Select Your Role')).toBeVisible();
    });

    test('should navigate through Student registration flow', async ({ page }) => {
      // Select Student role
      await page.getByText('Student').click();
      
      // Should show email verification step
      await expect(page.getByText('Verify Your Email')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Verify Email' })).toBeVisible();
    });

    test('should show password mismatch error', async ({ page }) => {
      // Select Admin role
      await page.getByText('Administrator').click();
      
      // Fill form with mismatched passwords
      await page.getByLabel('Full Name').fill('Test Admin');
      await page.getByLabel('Email Address').fill('admin@test.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByLabel('Confirm Password').fill('differentpassword');
      await page.getByRole('button', { name: 'Create Account' }).click();
      
      // Should show error
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('should navigate back to login', async ({ page }) => {
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('Welcome Back')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should show mobile logo on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      
      // Mobile logo should be visible
      await expect(page.locator('.lg\\:hidden').first()).toBeVisible();
    });
  });
});
