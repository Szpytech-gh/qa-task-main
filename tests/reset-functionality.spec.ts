import { test, expect } from '@playwright/test';
import { TicTacToeGamePage, GAME_SCENARIOS } from './helpers/game-helpers';

test.describe('Reset Functionality', () => {
  let gamePage: TicTacToeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new TicTacToeGamePage(page);
    await gamePage.goto();
  });

  test.describe('Reset Scenarios', () => {
    const resetScenarios = [
      {
        name: 'active game',
        setup: async () => await gamePage.playMoves([0, 1, 2, 3]),
        description: 'mid-game state with multiple moves'
      },
      {
        name: 'completed game with X winner',
        setup: async () => await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow),
        description: 'game that ended with X victory'
      },
      {
        name: 'completed game with O winner', 
        setup: async () => await gamePage.playMoves(GAME_SCENARIOS.oWinsMiddleColumn),
        description: 'game that ended with O victory'
      },
      {
        name: 'draw game',
        setup: async () => await gamePage.playMoves(GAME_SCENARIOS.drawGame),
        description: 'game that ended in a draw'
      }
    ];

    for (const scenario of resetScenarios) {
      test(`should reset ${scenario.name}`, async () => {
        // Setup the scenario
        await scenario.setup();
        
        // Perform reset
        await gamePage.reset();
        
        // Verify reset state
        await gamePage.expectAllSquaresEmpty();
        await gamePage.expectStatus('Next player: X');
        expect(await gamePage.getHistoryButtonsCount()).toBe(1);
        
        // Verify game is playable after reset
        await gamePage.clickSquare(4);
        await gamePage.expectSquareValue(4, 'X');
        await gamePage.expectStatus('Next player: O');
      });
    }
  });

  test.describe('Reset from History Position', () => {
    test('should reset from historical position', async () => {
      await gamePage.playMoves([0, 1, 2, 3, 4]);
      
      // Navigate to earlier position
      await gamePage.clickHistoryMove(2);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareValue(1, 'O');
      
      // Reset from this position
      await gamePage.reset();
      
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
    });

    test('should reset after creating new branch', async () => {
      await gamePage.playMoves([0, 1, 2, 3]);
      
      // Create new branch
      await gamePage.clickHistoryMove(2);
      await gamePage.clickSquare(4);
      
      // Reset
      await gamePage.reset();
      
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
    });
  });

  test.describe('Reset Button Behavior', () => {
    test('should be visible and clickable at all times', async () => {
      // Initial state
      await expect(gamePage.resetButton).toBeVisible();
      await expect(gamePage.resetButton).toBeEnabled();
      
      // During game
      await gamePage.playMoves([0, 1, 2]);
      await expect(gamePage.resetButton).toBeVisible();
      await expect(gamePage.resetButton).toBeEnabled();
      
      // After game completion
      await gamePage.playMoves([3, 4, 6]); // X wins
      await expect(gamePage.resetButton).toBeVisible();
      await expect(gamePage.resetButton).toBeEnabled();
      
      // In historical position
      await gamePage.clickHistoryMove(2);
      await expect(gamePage.resetButton).toBeVisible();
      await expect(gamePage.resetButton).toBeEnabled();
    });

    test('should work consistently with multiple resets', async () => {
      // Perform multiple reset cycles
      for (let i = 0; i < 3; i++) {
        await gamePage.playMoves([0, 1, 2]);
        await gamePage.reset();
        await gamePage.expectAllSquaresEmpty();
        await gamePage.expectStatus('Next player: X');
      }
      
      // Game should still be functional
      await gamePage.clickSquare(4);
      await gamePage.expectSquareValue(4, 'X');
    });
  });

  test.describe('Reset State Integrity', () => {
    test('should completely clear game state', async () => {
      // Create complex game state
      await gamePage.playMoves([0, 1, 2, 3]);
      await gamePage.clickHistoryMove(2);
      await gamePage.clickSquare(4);
      
      // Reset
      await gamePage.reset();
      
      // Verify complete state reset
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
      
      // Verify fresh game start
      await gamePage.clickSquare(0);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectStatus('Next player: O');
      expect(await gamePage.getHistoryButtonsCount()).toBe(2);
    });

    test('should reset consistently under rapid operations', async () => {
      // Rapid sequence of operations and resets
      for (let i = 0; i < 5; i++) {
        await gamePage.clickSquare(i);
        await gamePage.reset();
        await gamePage.expectAllSquaresEmpty();
      }
      
      // Final verification
      await gamePage.expectStatus('Next player: X');
      expect(await gamePage.getHistoryButtonsCount()).toBe(1);
    });
  });
});