import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class ColorContrastChecker {
	/**
	 * Check for color contrast issues in CSS styles (WCAG 1.4.3 - Level AA)
	 */
	static checkColorContrastIssue(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for color and background-color combinations
		if (trimmedLine.includes('color:') || trimmedLine.includes('background-color:')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Color contrast validation needed - ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
				severity: 'HIGH',
				range: range
			};
		}
		
		// Check for inline styles with color
		if (trimmedLine.includes('style=') && 
			(trimmedLine.includes('color:') || trimmedLine.includes('background-color:'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Inline color styles detected - verify contrast ratio meets WCAG 2.1 AA standards',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for color-only information conveyance (WCAG 1.4.1 - Level A)
	 */
	static checkColorOnlyInformation(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for color-based indicators without alternative indicators
		if (trimmedLine.includes('color:') && 
			(trimmedLine.includes('red') || trimmedLine.includes('green') || 
			 trimmedLine.includes('blue') || trimmedLine.includes('yellow')) &&
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('title=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Color-only information detected - ensure information is not conveyed by color alone',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for non-text contrast issues (WCAG 1.4.11 - Level AA)
	 */
	static checkNonTextContrast(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for UI components that need contrast validation
		if (trimmedLine.includes('border:') || trimmedLine.includes('outline:') ||
			trimmedLine.includes('box-shadow:') || trimmedLine.includes('background:')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'UI component styling detected - ensure sufficient contrast ratio (3:1) for visual elements',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for focus indicator contrast (WCAG 2.4.7 - Level AA)
	 */
	static checkFocusIndicatorContrast(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for focus styles
		if (trimmedLine.includes(':focus') || trimmedLine.includes(':focus-visible')) {
			if (trimmedLine.includes('outline: none') || trimmedLine.includes('outline: 0')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Focus outline removed - ensure alternative focus indicator has sufficient contrast',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for text spacing that might affect contrast (WCAG 1.4.12 - Level AA)
	 */
	static checkTextSpacing(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for text spacing properties
		if (trimmedLine.includes('line-height:') || trimmedLine.includes('letter-spacing:') ||
			trimmedLine.includes('word-spacing:') || trimmedLine.includes('text-indent:')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Text spacing detected - ensure content remains accessible when spacing is adjusted',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all color contrast accessibility checks
	 */
	static checkColorContrastIssues(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkColorContrastIssue(line, lineNumber),
			this.checkColorOnlyInformation(line, lineNumber),
			this.checkNonTextContrast(line, lineNumber),
			this.checkFocusIndicatorContrast(line, lineNumber),
			this.checkTextSpacing(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
