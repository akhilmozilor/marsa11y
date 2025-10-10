// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AccessibilityChecker } from './accessibilityChecker';
import { ImageChecker } from './imageChecker';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "marsa11yfix" is now active!');

	// Create a diagnostic collection for accessibility issues
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility');
	context.subscriptions.push(diagnosticCollection);

	// Create status bar button for auto-fix
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(tools) Auto-fix Alt Tags";
	statusBarItem.tooltip = "Click to auto-fix missing alt tags in this HTML file";
	statusBarItem.command = 'marsa11yfix.autoFixAltTags';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Listen for HTML file edits and check for accessibility issues
	const htmlFileWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
		const fileName = event.document.fileName;
		if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
			console.log(`\n🔍 Accessibility Check - HTML file edited: ${fileName}`);
			AccessibilityChecker.checkAccessibilityIssues(event.document, diagnosticCollection);
		}
	});


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const helloWorldCommand = vscode.commands.registerCommand('marsa11yfix.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from marsa11yFix!!');
	});

	// Auto-fix all missing alt tags in the current document
	const autoFixAltTagsCommand = vscode.commands.registerCommand('marsa11yfix.autoFixAltTags', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const document = editor.document;
		if (!document.fileName.endsWith('.html') && !document.fileName.endsWith('.htm')) {
			vscode.window.showErrorMessage('This command only works with HTML files');
			return;
		}

		await ImageChecker.autoFixMissingAltTags(document);
	});

	// Auto-fix the current image (where cursor is positioned)
	const autoFixCurrentImageCommand = vscode.commands.registerCommand('marsa11yfix.autoFixCurrentImage', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const document = editor.document;
		if (!document.fileName.endsWith('.html') && !document.fileName.endsWith('.htm')) {
			vscode.window.showErrorMessage('This command only works with HTML files');
			return;
		}

		const lineNumber = editor.selection.active.line;
		await ImageChecker.autoFixSpecificImage(document, lineNumber);
	});

	context.subscriptions.push(helloWorldCommand, autoFixAltTagsCommand, autoFixCurrentImageCommand, htmlFileWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {}
