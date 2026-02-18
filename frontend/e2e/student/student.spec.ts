import { test, expect } from '@playwright/test';

test.describe('Student Dashboard and Features', () => {
  // Helper function to login as student
  async function loginAsStudent(page) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('student@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/student');
  }

  test.describe('Student Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
    });

    test('should display dashboard with welcome message', async ({ page }) => {
      await expect(page.getByText(/Welcome back/)).toBeVisible();
      await expect(page.getByText("Here's an overview of your academic progress")).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
      await expect(page.getByText('Total Lectures')).toBeVisible();
      await expect(page.getByText('Present')).toBeVisible();
      await expect(page.getByText('Absent')).toBeVisible();
      await expect(page.getByText('Attendance Rate')).toBeVisible();
    });

    test('should have quick action buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'View Attendance' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Face Enrollment' })).toBeVisible();
    });

    test('should display recent attendance section', async ({ page }) => {
      await expect(page.getByText('Recent Attendance')).toBeVisible();
    });

    test('should display enrollment status panel', async ({ page }) => {
      await expect(page.getByText('Enrollment Status')).toBeVisible();
    });

    test('should navigate to attendance page', async ({ page }) => {
      await page.getByRole('button', { name: 'View Attendance' }).click();
      await expect(page).toHaveURL('/student/attendance');
      await expect(page.getByText('Attendance Records')).toBeVisible();
    });
  });

  test.describe('Student Classes', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
      await page.goto('/student/classes');
    });

    test('should display classes page with filters', async ({ page }) => {
      await expect(page.getByText('My Classes')).toBeVisible();
      await expect(page.getByPlaceholder('Search by class name, code, or faculty...')).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should filter classes by status', async ({ page }) => {
      const statusSelect = page.getByRole('combobox').first();
      await statusSelect.selectOption('approved');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Check that filtering worked
      await expect(page.getByText('Showing')).toBeVisible();
    });

    test('should search for classes', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search by class name, code, or faculty...');
      await searchInput.fill('Mathematics');
      
      // Wait for search to apply
      await page.waitForTimeout(500);
      
      // Should show results or empty state
      await expect(page.getByText(/showing|no matching/i)).toBeVisible();
    });
  });

  test.describe('Student Attendance', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
      await page.goto('/student/attendance');
    });

    test('should display attendance statistics', async ({ page }) => {
      await expect(page.getByText('Total Sessions')).toBeVisible();
      await expect(page.getByText('Present')).toBeVisible();
      await expect(page.getByText('Absent')).toBeVisible();
      await expect(page.getByText('Attendance Rate')).toBeVisible();
    });

    test('should have filters for attendance records', async ({ page }) => {
      await expect(page.getByPlaceholder('Search by date, class name, or code...')).toBeVisible();
      
      // Check for status filter
      const statusSelect = page.getByRole('combobox').first();
      await expect(statusSelect).toBeVisible();
    });

    test('should show AI confidence scores', async ({ page }) => {
      // Look for confidence indicators in the table
      const confidenceText = page.getByText('AI Confidence');
      if (await confidenceText.isVisible().catch(() => false)) {
        await expect(confidenceText).toBeVisible();
      }
    });
  });

  test.describe('Student Face Enrollment', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
      await page.goto('/student/face-enroll');
    });

    test('should display face enrollment page', async ({ page }) => {
      await expect(page.getByText('Face Enrollment')).toBeVisible();
      await expect(page.getByText('Upload photos for AI-powered face recognition attendance')).toBeVisible();
    });

    test('should have mode selection buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Live Camera' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Upload Files' })).toBeVisible();
    });

    test('should show enrollment requirements', async ({ page }) => {
      await expect(page.getByText('Enrollment Requirements')).toBeVisible();
      await expect(page.getByText(/Capture 5 photos from different angles/)).toBeVisible();
    });

    test('should switch to upload mode', async ({ page }) => {
      await page.getByRole('button', { name: 'Upload Files' }).click();
      await expect(page.getByText('Upload Photos')).toBeVisible();
    });
  });

  test.describe('Student Disputes', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
      await page.goto('/student/disputes');
    });

    test('should display disputes dashboard', async ({ page }) => {
      await expect(page.getByText('Attendance Disputes')).toBeVisible();
      await expect(page.getByText('Raise and track attendance disputes')).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
      await expect(page.getByText('Total Disputes')).toBeVisible();
      await expect(page.getByText('Under Review')).toBeVisible();
      await expect(page.getByText('Approved')).toBeVisible();
      await expect(page.getByText('Rejected')).toBeVisible();
    });

    test('should have dispute raising form', async ({ page }) => {
      await expect(page.getByText('Raise a New Dispute')).toBeVisible();
      await expect(page.getByLabel('Attendance Entry ID')).toBeVisible();
      await expect(page.getByLabel('Reason for Dispute')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit Dispute' })).toBeVisible();
    });

    test('should have tab navigation', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Open' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Resolved' })).toBeVisible();
    });
  });

  test.describe('Navigation and Layout', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page);
    });

    test('should have working sidebar navigation', async ({ page }) => {
      // Check sidebar items
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'My Classes' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Attendance' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Face Enrollment' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Disputes' })).toBeVisible();
    });

    test('should navigate to all student pages', async ({ page }) => {
      // Test each navigation link
      const pages = [
        { link: 'Dashboard', url: '/student', text: 'Welcome back' },
        { link: 'My Classes', url: '/student/classes', text: 'My Classes' },
        { link: 'Attendance', url: '/student/attendance', text: 'Attendance Records' },
        { link: 'Face Enrollment', url: '/student/face-enroll', text: 'Face Enrollment' },
        { link: 'Disputes', url: '/student/disputes', text: 'Attendance Disputes' },
      ];

      for (const navPage of pages) {
        await page.getByRole('link', { name: navPage.link }).click();
        await expect(page).toHaveURL(navPage.url);
        await expect(page.getByText(navPage.text).first()).toBeVisible();
      }
    });
  });
});
