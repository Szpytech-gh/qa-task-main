import { test, expect } from '@playwright/test';
import { TicTacToeGamePage, WIN_SCENARIOS, GAME_SCENARIOS } from './helpers/game-helpers';

test.describe('Win Detection', () => {
  let gamePage: TicTacToeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new TicTacToeGamePage(page);
    await gamePage.goto();
  });

  test.describe('Winning Combinations', () => {
    // Parameterized test for all winning combinations
    for (const scenario of WIN_SCENARIOS) {
      test(`should detect ${scenario.winner} win with ${scenario.name}`, async () => {
        await gamePage.playMoves(scenario.moves);
        
        await gamePage.expectStatus(`Winner: ${scenario.winner}`);
        await gamePage.expectWinningLine(scenario.combination, scenario.winner);
        
        // Verify game stops accepting moves after win
        const emptySquare = Array.from({ length: 9 }, (_, i) => i)
          .find(i => !scenario.combination.includes(i) && 
                    !scenario.moves.slice(1, -1).includes(i));
        
        if (emptySquare !== undefined) {
          await gamePage.clickSquare(emptySquare);
          await gamePage.expectSquareEmpty(emptySquare);
        }
      });
    }
  });

  test.describe('Specific Win Scenarios', () => {
    test('should handle X wins horizontally', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow);
      await gamePage.expectStatus('Winner: X');
      await gamePage.expectWinningLine([0, 1, 2], 'X');
    });

    test('should handle O wins vertically', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.oWinsMiddleColumn);
      await gamePage.expectStatus('Winner: O');
      await gamePage.expectWinningLine([1, 4, 7], 'O');
    });

    test('should handle diagonal wins correctly', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsDiagonal);
      await gamePage.expectStatus('Winner: X');
      await gamePage.expectWinningLine([0, 4, 8], 'X');
    });
  });

  test.describe('Post-Win Behavior', () => {
    test('should prevent all moves after game ends', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow);
      await gamePage.expectStatus('Winner: X');

      // Try to make moves on all empty squares
      const emptySquares = [5, 6, 7, 8];
      for (const square of emptySquares) {
        await gamePage.clickSquare(square);
        await gamePage.expectSquareEmpty(square);
      }

      // Status should remain unchanged
      await gamePage.expectStatus('Winner: X');
    });

    test('should maintain win state consistently', async () => {
      await gamePage.playMoves(GAME_SCENARIOS.xWinsTopRow);
      await gamePage.expectStatus('Winner: X');

      // Wait and verify state remains consistent
      await gamePage.page.waitForTimeout(500);
      await gamePage.expectStatus('Winner: X');
      await gamePage.expectWinningLine([0, 1, 2], 'X');
    });
  });

  test.describe('Win Detection Edge Cases', () => {
    test('should detect win immediately on winning move', async () => {
      // Set up game state just before winning move
      await gamePage.playMoves([0, 3, 1, 4]);
      await gamePage.expectStatus('Next player: X');

      await gamePage.clickSquare(2);
      await gamePage.expectStatus('Winner: X');
    });

    test('should not detect false wins', async () => {
      // Create a pattern that looks like it might win but doesn't
      await gamePage.playMoves([0, 1, 3, 4]);
      
      // Neither should be winner yet
      const status = await gamePage.getStatusText();
      expect(status).not.toContain('Winner');
      expect(status).toContain('Next player:');
    });
  });
});