import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class FormElementsChecker {
	/**
	 * Check for missing labels on form inputs
	 */
	static checkFormInputLabels(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('<input') || trimmedLine.includes('<textarea') || trimmedLine.includes('<select')) && 
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby') && 
			!trimmedLine.includes('id=') && !trimmedLine.includes('placeholder=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Form input missing label, aria-label, or aria-labelledby',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing form labels
	 */
	static checkFormLabels(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<label') && !trimmedLine.includes('for=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Label element missing for attribute',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all form-related accessibility checks
	 */
	static checkFormElements(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkFormInputLabels(line, lineNumber),
			this.checkFormLabels(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
