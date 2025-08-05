import { test, expect } from '@playwright/test';

test.describe('Super Map App', () => {
  test('should load the homepage and display main elements', async ({ page }) => {
    await page.goto('/');
    
    // Check main title and subtitle
    await expect(page.getByText('Super Map')).toBeVisible();
    await expect(page.getByText('AI-powered places discovery')).toBeVisible();
    
    // Check location tracker section
    await expect(page.getByText('Location Tracker')).toBeVisible();
    await expect(page.getByRole('button', { name: /get current location/i })).toBeVisible();
  });

  test('should show location button interactions', async ({ page }) => {
    await page.goto('/');
    
    const locationButton = page.getByRole('button', { name: /get current location/i });
    await expect(locationButton).toBeVisible();
    await expect(locationButton).toBeEnabled();
    
    // Mock geolocation to avoid actual location request in tests
    await page.addInitScript(() => {
      // Mock geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success) => {
            success({
              coords: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10
              }
            });
          }
        },
        writable: true
      });
    });
    
    await locationButton.click();
    
    // Should show location info after successful geolocation
    await expect(page.getByText(/latitude:/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/longitude:/i)).toBeVisible();
    await expect(page.getByText(/accuracy:/i)).toBeVisible();
  });

  test('should handle geolocation errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    await page.addInitScript(() => {
      // Mock geolocation error
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success, error) => {
            error({ message: 'Permission denied' });
          }
        },
        writable: true
      });
    });
    
    const locationButton = page.getByRole('button', { name: /get current location/i });
    await locationButton.click();
    
    // Should show error message
    await expect(page.getByText(/error getting location/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle missing geolocation support', async ({ page }) => {
    await page.addInitScript(() => {
      // Remove geolocation support
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true
      });
    });
    
    await page.goto('/');
    
    // Should show not supported message
    await expect(page.getByText(/geolocation is not supported/i)).toBeVisible();
  });
});