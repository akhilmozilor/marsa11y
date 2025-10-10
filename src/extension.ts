// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "marsa11yfix" is now active!');

	// Create a diagnostic collection for accessibility issues
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility');
	context.subscriptions.push(diagnosticCollection);

	// Listen for HTML file edits and check for accessibility issues
	const htmlFileWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
		const fileName = event.document.fileName;
		if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
			console.log(`\n🔍 Accessibility Check - HTML file edited: ${fileName}`);
			checkAccessibilityIssues(event.document, diagnosticCollection);
		}
	});

	// Function to check for common accessibility issues
	function checkAccessibilityIssues(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection) {
		const text = document.getText();
		const lines = text.split('\n');
		const issues: Array<{line: number, issue: string, severity: string, range: vscode.Range}> = [];
		const diagnostics: vscode.Diagnostic[] = [];

		lines.forEach((line, index) => {
			const lineNumber = index;
			const trimmedLine = line.trim();

			// Check for missing alt attributes on images
			if (trimmedLine.includes('<img') && !trimmedLine.includes('alt=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Missing alt attribute on image',
					severity: 'HIGH',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Error));
			}

			// Check for empty alt attributes
			if (trimmedLine.includes('alt=""') || trimmedLine.includes("alt=''")) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Empty alt attribute - consider if image is decorative or needs description',
					severity: 'MEDIUM',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Warning));
			}

			// Check for missing labels on form inputs
			if ((trimmedLine.includes('<input') || trimmedLine.includes('<textarea') || trimmedLine.includes('<select')) && 
				!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby') && 
				!trimmedLine.includes('id=') && !trimmedLine.includes('placeholder=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Form input missing label, aria-label, or aria-labelledby',
					severity: 'HIGH',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Error));
			}

			// Check for missing heading structure
			if (trimmedLine.includes('<h1>') || trimmedLine.includes('<h2>') || trimmedLine.includes('<h3>') || 
				trimmedLine.includes('<h4>') || trimmedLine.includes('<h5>') || trimmedLine.includes('<h6>')) {
				// This is a basic check - in a real implementation, you'd track heading hierarchy
				if (trimmedLine.includes('<h1>') && !text.includes('<h1>')) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					const issue = {
						line: lineNumber + 1,
						issue: 'Multiple h1 tags found - page should have only one h1',
						severity: 'MEDIUM',
						range: range
					};
					issues.push(issue);
					diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Warning));
				}
			}

			// Check for missing lang attribute on html tag
			if (trimmedLine.includes('<html') && !trimmedLine.includes('lang=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Missing lang attribute on html tag',
					severity: 'HIGH',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Error));
			}

			// Check for clickable elements without keyboard accessibility
			if ((trimmedLine.includes('<div') || trimmedLine.includes('<span')) && 
				trimmedLine.includes('onclick') && !trimmedLine.includes('tabindex') && !trimmedLine.includes('role=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Clickable div/span without keyboard accessibility - add tabindex and role',
					severity: 'HIGH',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Error));
			}

			// Check for missing form labels
			if (trimmedLine.includes('<label') && !trimmedLine.includes('for=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Label element missing for attribute',
					severity: 'MEDIUM',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Warning));
			}

			// Check for color-only information
			if (trimmedLine.includes('color:') || trimmedLine.includes('background-color:')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Color styling detected - ensure information is not conveyed by color alone',
					severity: 'LOW',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Information));
			}

			// Check for missing focus indicators
			if (trimmedLine.includes(':focus') && trimmedLine.includes('outline: none')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				const issue = {
					line: lineNumber + 1,
					issue: 'Focus outline removed without alternative focus indicator',
					severity: 'HIGH',
					range: range
				};
				issues.push(issue);
				diagnostics.push(createDiagnostic(range, issue.issue, vscode.DiagnosticSeverity.Error));
			}
		});

		// Update diagnostics in the editor
		diagnosticCollection.set(document.uri, diagnostics);

		// Output results
		if (issues.length === 0) {
			console.log('✅ No accessibility issues detected in this edit!');
		} else {
			console.log(`\n⚠️  Found ${issues.length} accessibility issue(s):`);
			console.log('=' .repeat(50));
			
			issues.forEach(issue => {
				const severityIcon = issue.severity === 'HIGH' ? '🔴' : 
									issue.severity === 'MEDIUM' ? '🟡' : '🟢';
				console.log(`${severityIcon} Line ${issue.line}: ${issue.issue} (${issue.severity})`);
			});
			
			console.log('=' .repeat(50));
			console.log('💡 Tip: Fix these issues to improve accessibility for all users');
		}
	}

	// Helper function to create diagnostics
	function createDiagnostic(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity): vscode.Diagnostic {
		const diagnostic = new vscode.Diagnostic(range, message, severity);
		diagnostic.source = 'MARSA11Y Checker';
		return diagnostic;
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('marsa11yfix.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from marsa11yFix!!');
	});

	context.subscriptions.push(disposable, htmlFileWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {}
