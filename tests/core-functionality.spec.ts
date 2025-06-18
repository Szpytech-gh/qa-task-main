import { test, expect } from '@playwright/test';
import { TicTacToeGamePage, GAME_SCENARIOS } from './helpers/game-helpers';

test.describe('Core Game Functionality', () => {
  let gamePage: TicTacToeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new TicTacToeGamePage(page);
    await gamePage.goto();
  });

  test.describe('Game Initialization', () => {
    test('should load with correct initial state', async () => {
      await gamePage.expectGameBoardVisible();
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');
      await gamePage.expectHistorySectionVisible();
      await gamePage.expectResetButtonVisible();
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
    });

    test('should display all UI elements correctly', async () => {
      await expect(gamePage.gameBoard).toBeVisible();
      await expect(gamePage.status).toBeVisible();
      await expect(gamePage.resetButton).toBeVisible();
      await expect(gamePage.historySection).toBeVisible();
      await expect(gamePage.squares).toHaveCount(9);

      // All squares should be clickable initially
      for (let i = 0; i < 9; i++) {
        await expect(gamePage.squares.nth(i)).toBeEnabled();
      }
    });
  });

  test.describe('Basic Move Mechanics', () => {
    test('should place moves and alternate turns correctly', async () => {
      await gamePage.clickSquare(0);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectStatus('Next player: O');

      await gamePage.clickSquare(1);
      await gamePage.expectSquareValue(1, 'O');
      await gamePage.expectStatus('Next player: X');

      await gamePage.clickSquare(2);
      await gamePage.expectSquareValue(2, 'X');
      await gamePage.expectStatus('Next player: O');

      await gamePage.clickSquare(3);
      await gamePage.expectSquareValue(3, 'O');
      await gamePage.expectStatus('Next player: X');
    });

    test('should prevent moves on occupied squares', async () => {
      await gamePage.clickSquare(0);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectStatus('Next player: O');

      // Try to click same square
      await gamePage.clickSquare(0);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectStatus('Next player: O');
    });

    test('should allow moves on all positions without forming winning lines', async () => {
        await gamePage.playMoves(GAME_SCENARIOS.drawGame);
  
        // Verify all 9 squares are filled
        for (let i = 0; i < 9; i++) {
          const value = await gamePage.getSquareValue(i);
          expect(['X', 'O']).toContain(value);
        }
      });
  });

  test.describe('Game State Management', () => {
    test('should maintain correct state during rapid interactions', async () => {
      // Test rapid but sequential clicking
      await gamePage.clickSquare(0);
      await gamePage.clickSquare(1);
      await gamePage.clickSquare(2);

      // Verify the moves were placed in the correct order
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareValue(1, 'O');
      await gamePage.expectSquareValue(2, 'X');
      await gamePage.expectStatus('Next player: O');
    });

    test('should handle complex state transitions correctly', async () => {
      // Do sequence of moves
      await gamePage.playMoves([0, 1, 2]);
      
      // Navigate back in history
      await gamePage.clickHistoryMove(1);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareEmpty(1);
      
      // Make different move
      await gamePage.clickSquare(3);
      await gamePage.expectSquareValue(3, 'O');
      
      // Reset and verify clean state
      await gamePage.reset();
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
    });
  });

  test.describe('Draw Game Detection', () => {
    test('should handle draw game correctly', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.drawGame);

      // Verify all squares are filled
      for (let i = 0; i < 9; i++) {
        const value = await gamePage.getSquareValue(i);
        expect(['X', 'O']).toContain(value);
      }

      const status = await gamePage.getStatusText();
      expect(status).not.toContain('Winner');
      
      // Game should not accept more moves
      await gamePage.clickSquare(0);
      const square0Value = await gamePage.getSquareValue(0);
      expect(square0Value).toBe('X');
    });
  });
});