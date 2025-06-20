import { test, expect } from '@playwright/test';
import { TicTacToeGamePage } from './helpers/game-helpers';

test.describe('Layout and Accessibility', () => {
  let gamePage: TicTacToeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new TicTacToeGamePage(page);
    await gamePage.goto();
  });

  test.describe('Accessibility and Usability', () => {
    test('should have proper keyboard navigation support', async () => {
      // Focus should be manageable with keyboard
      await gamePage.squares.nth(0).focus();
      await expect(gamePage.squares.nth(0)).toBeFocused();
      await gamePage.page.keyboard.press('Enter');
      
      // Tab navigation through squares
      await gamePage.page.keyboard.press('Tab');
      await expect(gamePage.squares.nth(1)).toBeFocused();
      
      // Reset button should be keyboard accessible
      await gamePage.resetButton.focus();
      await expect(gamePage.resetButton).toBeFocused();
      
      // Should be able to activate with Enter/Space
      await gamePage.page.keyboard.press('Enter');
      await gamePage.expectAllSquaresEmpty();
    });
  });
});