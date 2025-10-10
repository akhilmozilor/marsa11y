# MARSA11y Accessibility Checker

A VS Code extension that helps developers identify and fix accessibility issues in HTML files while coding. Get real-time feedback with visual indicators, detailed console output, and AI-powered auto-fixing capabilities to make your web content more accessible.

## Features

- **Real-time Accessibility Checking**: Automatically detects accessibility issues as you type in HTML files
- **Visual Indicators**: Red, yellow, and blue underlines highlight issues directly in your code
- **AI-Powered Auto-Fixing**: Automatically generate alt text for images using OpenAI
- **Context Menu Integration**: Right-click on images to auto-fix alt tags
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
* `marsa11yfix.autoFixAltTags`: Auto-fix all missing alt tags in the current HTML file
* `marsa11yfix.autoFixCurrentImage`: Auto-fix alt tag for the currently selected image

## Configuration

The extension can be configured through VS Code settings:

* `marsa11yfix.openaiApiKey`: OpenAI API key for auto-generating alt text descriptions
  - **Type**: string
  - **Default**: (empty)
  - **Description**: Required for AI-powered alt text generation

## Installation

1. Install the extension from the VS Code marketplace
2. (Optional) Configure your OpenAI API key in settings for auto-fixing features
3. Open an HTML file
4. Start coding - the extension will automatically check for accessibility issues

## Usage

### Real-time Checking
Simply open any HTML file and start coding. The extension will:
- Show red underlines for high-priority accessibility issues
- Show yellow underlines for medium-priority issues  
- Show blue underlines for low-priority warnings
- Log detailed information to the console
- Display issues in the Problems panel

### Auto-Fixing Features
1. **Right-click on an image** → Select "Auto-fix Current Image Alt Tag" from the context menu
2. **Command Palette** (Ctrl+Shift+P) → "Auto-fix Missing Alt Tags" to fix all images in the file
3. **Ensure OpenAI API key** is configured in settings for AI-powered alt text generation

## Known Issues

- Some advanced accessibility patterns may not be detected
- AI auto-fixing requires OpenAI API key configuration
- Auto-fixing is currently limited to alt text generation

## Release Notes

### 0.0.1

Initial release of MARSA11y Accessibility Checker:
- Real-time HTML accessibility checking
- Visual indicators with colored underlines
- Comprehensive issue detection
- Console logging and Problems panel integration
- AI-powered auto-fixing for missing alt tags
- Context menu integration for quick fixes
- OpenAI integration for intelligent alt text generation

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
