import { test, expect } from '@playwright/test';
import { TicTacToeGamePage, GAME_SCENARIOS } from './helpers/game-helpers';

test.describe('History and Time Travel', () => {
  let gamePage: TicTacToeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new TicTacToeGamePage(page);
    await gamePage.goto();
  });

  test.describe('Basic History Navigation', () => {
    test('should track move history correctly', async () => {
      const moves = [0, 1, 2, 3];
      await gamePage.playMoves(moves);
      
      // Should have initial state + 4 moves = 5 buttons
      expect(await gamePage.getHistoryButtonsCount()).toBe(5);
    });

    test('should navigate to different game states', async () => {
      await gamePage.playMoves([0, 1, 2, 3]);

      // Navigate to game start
      await gamePage.clickHistoryMove(0);
      await gamePage.expectAllSquaresEmpty();
      await gamePage.expectStatus('Next player: X');

      // Navigate to move 2 (X played 0, O played 1)
      await gamePage.clickHistoryMove(2);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareValue(1, 'O');
      await gamePage.expectSquareEmpty(2);
      await gamePage.expectSquareEmpty(3);

      // Navigate to move 4 (all moves played)
      await gamePage.clickHistoryMove(4);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareValue(1, 'O');
      await gamePage.expectSquareValue(2, 'X');
      await gamePage.expectSquareValue(3, 'O');
    });

    test('should maintain correct turn indicator when navigating', async () => {
      await gamePage.playMoves([0, 1, 2]);

      // At move 1 (after X played 0), it should be O's turn
      await gamePage.clickHistoryMove(1);
      await gamePage.expectStatus('Next player: O');

      // At move 2 (after O played 1), it should be X's turn
      await gamePage.clickHistoryMove(2);
      await gamePage.expectStatus('Next player: X');

      // At move 3 (after X played 2), it should be O's turn
      await gamePage.clickHistoryMove(3);
      await gamePage.expectStatus('Next player: O');
    });
  });

  test.describe('History Branch Creation', () => {
    test('should create new branch when making move from historical position', async () => {
      await gamePage.playMoves([0, 1, 2, 3, 4]);
      expect(await gamePage.getHistoryButtonsCount()).toBe(6);

      // Navigate back to move 3
      await gamePage.clickHistoryMove(3);
      
      // Make different move (original was 4, now play 5)
      await gamePage.clickSquare(5);
      
      // History should be truncated to reflect new branch
      expect(await gamePage.getHistoryButtonsCount()).toBe(5);
      await gamePage.expectSquareValue(5, 'O');
      await gamePage.expectSquareEmpty(4); // Original move should be gone
    });

    test('should handle multiple branch creations', async () => {
      // Create initial game state
      await gamePage.playMoves([0, 1, 2]);
      
      // Go back and create first branch
      await gamePage.clickHistoryMove(2);
      await gamePage.clickSquare(3);
      
      // Go back and create second branch
      await gamePage.clickHistoryMove(1);
      await gamePage.clickSquare(4);
      
      // Should be at move 2 with X at 0 and O at 4
      expect(await gamePage.getHistoryButtonsCount()).toBe(3);
      await gamePage.expectSquareValue(0, 'X');
      await gamePage.expectSquareValue(4, 'O');
      await gamePage.expectSquareEmpty(1);
      await gamePage.expectSquareEmpty(2);
      await gamePage.expectSquareEmpty(3);
    });
  });

  test.describe('History with Game Completion', () => {
    test('should navigate through completed game history', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow);
      await gamePage.expectStatus('Winner: X');

      // Navigate to before winning move
      await gamePage.clickHistoryMove(4);
      await gamePage.expectStatus('Next player: X');
      await gamePage.expectSquareEmpty(2); // Winning square should be empty

      // Navigate back to completed game
      await gamePage.clickHistoryMove(5);
      await gamePage.expectStatus('Winner: X');
      await gamePage.expectSquareValue(2, 'X');
    });

    test('should allow replaying from historical position', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow);
      await gamePage.expectStatus('Winner: X');

      // Navigate to middle of game
      await gamePage.clickHistoryMove(3);
      
      // Create different ending
      await gamePage.clickSquare(5); // Different from original move
      await gamePage.clickSquare(6);
      
      // Should be in new game state
      expect(await gamePage.getHistoryButtonsCount()).toBe(6);
      await gamePage.expectSquareValue(5, 'O');
      await gamePage.expectSquareValue(6, 'X');
      
      // Original winning state should be overwritten
      const status = await gamePage.getStatusText();
      expect(status).not.toBe('Winner: X');
    });
  });

  test.describe('History Edge Cases', () => {
    test('should handle rapid history navigation', async () => {
      await gamePage.playMoves([0, 1, 2, 3, 4, 5]);

      // Rapidly navigate through history
      for (let i = 0; i < 7; i++) {
        await gamePage.clickHistoryMove(i);
        await gamePage.page.waitForTimeout(10);
      }

      // Should end up at move 5
      expect(await gamePage.getHistoryButtonsCount()).toBe(7);
      await gamePage.expectSquareValue(4, 'X');
      await gamePage.expectSquareValue(5, 'O');
    });

    test('should maintain history integrity after multiple operations', async () => {
      // Complex sequence
      await gamePage.playMoves([0, 1, 2]);
      await gamePage.clickHistoryMove(1);
      await gamePage.clickSquare(3);
      await gamePage.clickHistoryMove(0);
      await gamePage.clickSquare(4);
      
      // Verify final state
      expect(await gamePage.getHistoryButtonsCount()).toBe(2);
      await gamePage.expectSquareValue(4, 'X');
      
      // All other squares should be empty
      for (let i = 0; i < 9; i++) {
        if (i !== 4) {
          await gamePage.expectSquareEmpty(i);
        }
      }
    });
  });


});