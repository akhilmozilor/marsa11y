import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class KeyboardNavigationChecker {
	/**
	 * Check for keyboard accessibility issues (WCAG 2.1.1 - Level A)
	 */
	static checkKeyboardAccessibility(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for clickable elements without keyboard support
		if ((trimmedLine.includes('<div') || trimmedLine.includes('<span')) && 
			trimmedLine.includes('onclick') && 
			!trimmedLine.includes('onkeydown') && 
			!trimmedLine.includes('onkeyup') && 
			!trimmedLine.includes('onkeypress') &&
			!trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Clickable element missing keyboard support - add onkeydown/onkeyup handlers or use semantic button element',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for keyboard trap issues (WCAG 2.1.2 - Level A)
	 */
	static checkKeyboardTrap(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements that might create keyboard traps
		if (trimmedLine.includes('tabindex=') && 
			(trimmedLine.includes('tabindex="0"') || trimmedLine.includes("tabindex='0'"))) {
			// Check for modal or dialog elements that might trap focus
			if (trimmedLine.includes('role="dialog"') || trimmedLine.includes('role="alertdialog"') ||
				trimmedLine.includes('modal') || trimmedLine.includes('popup')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Modal/dialog element detected - ensure keyboard trap is properly managed with Escape key',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing keyboard event handlers
	 */
	static checkMissingKeyboardHandlers(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for interactive elements without keyboard handlers
		if (trimmedLine.includes('onclick') && 
			!trimmedLine.includes('onkeydown') && 
			!trimmedLine.includes('onkeyup') &&
			!trimmedLine.includes('onkeypress') &&
			(trimmedLine.includes('<div') || trimmedLine.includes('<span'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Interactive element missing keyboard event handlers - add onkeydown/onkeyup for accessibility',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper keyboard navigation order
	 */
	static checkKeyboardNavigationOrder(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for positive tabindex values that disrupt natural order
		const positiveTabIndexMatch = trimmedLine.match(/tabindex=["']([1-9][0-9]*)["']/);
		if (positiveTabIndexMatch) {
			const tabIndexValue = positiveTabIndexMatch[1];
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: `Positive tabindex="${tabIndexValue}" disrupts natural keyboard navigation order - use tabindex="0" or negative values`,
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing skip links
	 */
	static checkMissingSkipLinks(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check if page has skip links
		if (trimmedLine.includes('<body') && !fullText.includes('skip') && !fullText.includes('skip-link')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Page missing skip links - add skip links for keyboard navigation to main content',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for keyboard shortcuts (WCAG 2.1.4 - Level A)
	 */
	static checkKeyboardShortcuts(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for keyboard shortcuts without alternatives
		if (trimmedLine.includes('onkeydown') && 
			(trimmedLine.includes('keyCode') || trimmedLine.includes('key') || trimmedLine.includes('which'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Keyboard shortcut detected - ensure users can turn off or remap shortcuts',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper ARIA keyboard navigation
	 */
	static checkAriaKeyboardNavigation(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for ARIA roles that require keyboard navigation
		if (trimmedLine.includes('role=') && 
			(trimmedLine.includes('role="menu"') || trimmedLine.includes('role="menubar"') ||
			 trimmedLine.includes('role="tablist"') || trimmedLine.includes('role="grid"'))) {
			
			if (!trimmedLine.includes('tabindex=') && !trimmedLine.includes('onkeydown')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'ARIA role requires keyboard navigation - add proper keyboard event handlers',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing keyboard navigation in forms
	 */
	static checkFormKeyboardNavigation(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for form elements without proper keyboard navigation
		if ((trimmedLine.includes('<select') || trimmedLine.includes('<input')) &&
			!trimmedLine.includes('tabindex=') && 
			!trimmedLine.includes('disabled')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Form element should be keyboard accessible - ensure proper tabindex and keyboard support',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all keyboard navigation accessibility checks
	 */
	static checkKeyboardNavigation(line: string, lineNumber: number, fullText: string): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkKeyboardAccessibility(line, lineNumber),
			this.checkKeyboardTrap(line, lineNumber),
			this.checkMissingKeyboardHandlers(line, lineNumber),
			this.checkKeyboardNavigationOrder(line, lineNumber),
			this.checkMissingSkipLinks(line, lineNumber, fullText),
			this.checkKeyboardShortcuts(line, lineNumber),
			this.checkAriaKeyboardNavigation(line, lineNumber),
			this.checkFormKeyboardNavigation(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
