import * as vscode from 'vscode';
import { FormElementsChecker } from './formElementsChecker';
import { ImageChecker } from './imageChecker';
import { OtherAccessibilityChecker } from './otherAccessibilityChecker';
import { AriaLabelRoleChecker } from './ariaLabelRoleChecker';
import { TabIndexChecker } from './tabIndexChecker';
import { SemanticHtmlChecker } from './semanticHtmlChecker';

export interface AccessibilityIssue {
	line: number;
	issue: string;
	severity: string;
	range: vscode.Range;
}

export class AccessibilityChecker {

	/**
	 * Run all accessibility checks on a document
	 */
	static checkAccessibilityIssues(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection): void {
		const text = document.getText();
		const lines = text.split('\n');
		const issues: AccessibilityIssue[] = [];
		const diagnostics: vscode.Diagnostic[] = [];

		lines.forEach((line, index) => {
			const lineNumber = index;

			// Run all checks using modular checkers
			const imageIssues = ImageChecker.checkImages(line, lineNumber);
			const formIssues = FormElementsChecker.checkFormElements(line, lineNumber);
			const otherIssues = OtherAccessibilityChecker.checkOtherAccessibility(line, lineNumber, text);
			const ariaRoleIssues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, lineNumber, text);
			const tabIndexIssues = TabIndexChecker.checkTabIndex(line, lineNumber);
			const semanticHtmlIssues = SemanticHtmlChecker.checkSemanticHtml(line, lineNumber, text);

			// Combine all issues
			const allIssues = [...imageIssues, ...formIssues, ...otherIssues, ...ariaRoleIssues, ...tabIndexIssues, ...semanticHtmlIssues];
			
			allIssues.forEach(issue => {
				issues.push(issue);
				diagnostics.push(this.createDiagnostic(issue.range, issue.issue, this.getSeverity(issue.severity)));
			});
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

	/**
	 * Helper function to create diagnostics
	 */
	private static createDiagnostic(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity): vscode.Diagnostic {
		const diagnostic = new vscode.Diagnostic(range, message, severity);
		diagnostic.source = 'MARSA11Y Checker';
		return diagnostic;
	}

	/**
	 * Convert severity string to VS Code diagnostic severity
	 */
	private static getSeverity(severity: string): vscode.DiagnosticSeverity {
		switch (severity) {
			case 'HIGH':
				return vscode.DiagnosticSeverity.Error;
			case 'MEDIUM':
				return vscode.DiagnosticSeverity.Warning;
			case 'LOW':
				return vscode.DiagnosticSeverity.Information;
			default:
				return vscode.DiagnosticSeverity.Information;
		}
	}
}
