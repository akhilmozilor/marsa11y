# marsa11yFix - Accessibility Checker

A VS Code extension that helps developers identify accessibility issues in HTML files while coding. Get real-time feedback with visual indicators and detailed console output to make your web content more accessible.

## Features

- **Real-time Accessibility Checking**: Automatically detects accessibility issues as you type in HTML files
- **Visual Indicators**: Red, yellow, and blue underlines highlight issues directly in your code
- **Comprehensive Issue Detection**: Checks for common accessibility problems including:
  - Missing alt attributes on images
  - Missing form labels and ARIA attributes
  - Missing language attributes
  - Keyboard accessibility issues
  - Color-only information warnings
  - Focus indicator problems
- **Console Feedback**: Detailed logging with severity levels and helpful tips
- **Problems Panel Integration**: All issues appear in VS Code's Problems panel for easy navigation

## How It Works

1. **Automatic Activation**: Extension activates when you open HTML files or when your workspace contains HTML files
2. **Real-time Monitoring**: Watches for changes in HTML files and analyzes them instantly
3. **Visual Feedback**: Shows colored underlines (red for high priority, yellow for medium, blue for low)
4. **Detailed Information**: Hover over underlined code to see specific accessibility issues

## Requirements

- VS Code 1.105.0 or higher
- HTML files in your workspace

## Extension Commands

This extension contributes the following commands:

* `marsa11yfix.helloWorld`: Display a welcome message
* `marsa11yfix.checkSelectedText`: Check accessibility for selected text (coming soon)

## Installation

1. Install the extension from the VS Code marketplace
2. Open an HTML file
3. Start coding - the extension will automatically check for accessibility issues

## Usage

Simply open any HTML file and start coding. The extension will:
- Show red underlines for high-priority accessibility issues
- Show yellow underlines for medium-priority issues  
- Show blue underlines for low-priority warnings
- Log detailed information to the console
- Display issues in the Problems panel

## Known Issues

- Currently checks entire HTML documents (selected text checking coming soon)
- Some advanced accessibility patterns may not be detected

## Release Notes

### 0.0.1

Initial release of marsa11yFix:
- Real-time HTML accessibility checking
- Visual indicators with colored underlines
- Comprehensive issue detection
- Console logging and Problems panel integration

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
