# Tic Tac Toe

## Task Description

This is a simple Tic Tac Toe game built with React.

Your task is to cover it with tests using Playwright.

### Game rules

- The game is played on a grid that's 3 squares by 3 squares.
- You are X, your friend is O. Players take turns putting their marks in empty squares.
- The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.
- When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a draw.
- You can restart the game at any time.
- The game should display the winner or a draw message when the game is over.
- The game should display the current player's turn.
- The game should display the history of the turns.
- The game should allow you to go back to any previous turn.

## Installation

Install dependencies:
```sh
npm install
```

Install Playwright browsers (required for testing):
```sh
npx playwright install
```

## Usage

To run the development server:
```sh
npm run dev
```

The game will be available at `http://localhost:5173`

## Testing

This project includes comprehensive end-to-end tests using Playwright.

### Test Structure

The tests are organized into several test suites:

- **Core Functionality** (`core-functionality.spec.ts`) - Basic game mechanics, initialization, and state management
- **Win Detection** (`win-detection.spec.ts`) - All winning combinations and post-win behavior
- **History Navigation** (`history-navigation.spec.ts`) - Time travel functionality and history management
- **Reset Functionality** (`reset-functionality.spec.ts`) - Reset button behavior in various scenarios
- **Accessibility** (`accessability.spec.ts`) - Keyboard navigation and accessibility features

### Running Tests

#### Basic Test Commands

Run all tests:
```sh
npm run test
```

Run tests with browser UI visible:
```sh
npm run test:headed
```

Run tests in Chrome only (headed):
```sh
npm run test:headed:chrome
```

Run tests on mobile Chrome:
```sh
npm run test:headed:mobile:chrome
```

Run tests with Playwright UI (interactive mode):
```sh
npm run test:ui
```

#### Specific Test Commands

Run a specific test file:
```sh
npm run test:core
# or
npx playwright test core-functionality.spec.ts
```

Run tests from a specific file with browser visible:
```sh
npm run test:headed:chrome:core
# or
npx playwright test core-functionality.spec.ts --headed --project=chromium
```

### Debugging Tests

#### Debug Mode

Debug a specific test by line number:
```sh
npx playwright test core-functionality.spec.ts:77 --debug --project=chromium
```

Debug a specific test by name:
```sh
npx playwright test -g "should load with correct initial state" --debug
```

### Test Reports

View the HTML test report:
```sh
npm run test:report
# or
npx playwright show-report
```

### Test Configuration

Tests are configured to:
- Run on multiple browsers (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- Start the development server automatically
- Run in parallel for faster execution

The test configuration can be found in `playwright.config.ts`.