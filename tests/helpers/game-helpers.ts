import { Page, Locator, expect } from '@playwright/test';

export class TicTacToeGamePage {
  readonly page: Page;
  readonly gameBoard: Locator;
  readonly status: Locator;
  readonly resetButton: Locator;
  readonly historySection: Locator;
  readonly squares: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameBoard = page.locator('.game-board');
    this.status = page.locator('.status');
    this.resetButton = page.locator('text="Reset"');
    this.historySection = page.locator('.game-info');
    this.squares = page.locator('.square');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickSquare(index: number) {
    await this.squares.nth(index).click();
  }

  async clickHistoryMove(moveIndex: number) {
    await this.page.locator('.game-info button').nth(moveIndex).click();
  }

  async reset() {
    await this.resetButton.click();
  }

  async getSquareValue(index: number): Promise<string> {
    return await this.squares.nth(index).textContent() || '';
  }

  async getStatusText(): Promise<string> {
    return await this.status.textContent() || '';
  }

  async getHistoryButtonsCount(): Promise<number> {
    return await this.page.locator('.game-info button').count();
  }

  async playMoves(moves: number[]) {
    for (const move of moves) {
      await this.clickSquare(move);
      await this.page.waitForTimeout(50); // Small delay for stability
    }
  }

  // Assertions
  async expectGameBoardVisible() {
    await expect(this.gameBoard).toBeVisible();
  }

  async expectSquareValue(index: number, expectedValue: string) {
    await expect(this.squares.nth(index)).toHaveText(expectedValue);
  }

  async expectSquareEmpty(index: number) {
    await expect(this.squares.nth(index)).toHaveText('');
  }

  async expectAllSquaresEmpty() {
    for (let i = 0; i < 9; i++) {
      await this.expectSquareEmpty(i);
    }
  }

  async expectStatus(expectedStatus: string) {
    await expect(this.status).toHaveText(expectedStatus);
  }

  async expectHistorySectionVisible() {
    await expect(this.historySection).toBeVisible();
  }

  async expectResetButtonVisible() {
    await expect(this.resetButton).toBeVisible();
  }

  async expectWinningLine(squares: number[], player: string) {
    for (const square of squares) {
      await this.expectSquareValue(square, player);
    }
  }
}

// Game constants and test data

export const GAME_SCENARIOS = {
  xWinsTopRow: [0, 3, 1, 4, 2],
  xWinsMiddleColumn: [1, 0, 4, 3, 7],
  oWinsMiddleColumn: [0, 1, 3, 4, 5, 7],
  xWinsDiagonal: [0, 1, 4, 2, 8],
  oWinsAntiDiagonal: [0, 2, 1, 4, 3, 6],
  drawGame: [0, 1, 2, 4, 3, 5, 7, 6, 8],
};

export const PLAYER_PATTERNS = {
  X: 'X',
  O: 'O',
  EMPTY: '',
} as const;

export type Player = keyof typeof PLAYER_PATTERNS;
export type GameSquare = typeof PLAYER_PATTERNS[Player];

// Test data for parameterized tests
export const WIN_SCENARIOS = [
  { name: 'Top Row', combination: [0, 1, 2], moves: [0, 3, 1, 4, 2], winner: 'X' },
  { name: 'Middle Row', combination: [3, 4, 5], moves: [3, 0, 4, 1, 5], winner: 'X' },
  { name: 'Bottom Row', combination: [6, 7, 8], moves: [6, 0, 7, 1, 8], winner: 'X' },
  { name: 'Left Column', combination: [0, 3, 6], moves: [0, 1, 3, 2, 6], winner: 'X' },
  { name: 'Middle Column', combination: [1, 4, 7], moves: [1, 0, 4, 2, 7], winner: 'X' },
  { name: 'Right Column', combination: [2, 5, 8], moves: [2, 0, 5, 1, 8], winner: 'X' },
  { name: 'Main Diagonal', combination: [0, 4, 8], moves: [0, 1, 4, 2, 8], winner: 'X' },
  { name: 'Anti Diagonal', combination: [2, 4, 6], moves: [2, 0, 4, 1, 6], winner: 'X' },
];
