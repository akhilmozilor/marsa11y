import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class OtherAccessibilityChecker {
	/**
	 * Check for missing heading structure
	 */
	static checkHeadingStructure(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<h1>') || trimmedLine.includes('<h2>') || trimmedLine.includes('<h3>') || 
			trimmedLine.includes('<h4>') || trimmedLine.includes('<h5>') || trimmedLine.includes('<h6>')) {
			// This is a basic check - in a real implementation, you'd track heading hierarchy
			if (trimmedLine.includes('<h1>') && !fullText.includes('<h1>')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Multiple h1 tags found - page should have only one h1',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing lang attribute on html tag
	 */
	static checkHtmlLangAttribute(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<html') && !trimmedLine.includes('lang=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Missing lang attribute on html tag',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for clickable elements without keyboard accessibility
	 */
	static checkKeyboardAccessibility(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('<div') || trimmedLine.includes('<span')) && 
			trimmedLine.includes('onclick') && !trimmedLine.includes('tabindex') && !trimmedLine.includes('role=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Clickable div/span without keyboard accessibility - add tabindex and role',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for color-only information
	 */
	static checkColorOnlyInformation(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('color:') || trimmedLine.includes('background-color:')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Color styling detected - ensure information is not conveyed by color alone',
				severity: 'LOW',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing focus indicators
	 */
	static checkFocusIndicators(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes(':focus') && trimmedLine.includes('outline: none')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Focus outline removed without alternative focus indicator',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all other accessibility checks
	 */
	static checkOtherAccessibility(line: string, lineNumber: number, fullText: string): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkHeadingStructure(line, lineNumber, fullText),
			this.checkHtmlLangAttribute(line, lineNumber),
			this.checkKeyboardAccessibility(line, lineNumber),
			this.checkColorOnlyInformation(line, lineNumber),
			this.checkFocusIndicators(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
