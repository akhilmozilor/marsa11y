import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class LabelNameConsistencyChecker {
	/**
	 * Check for label-name consistency (WCAG 2.5.3 - Level A)
	 */
	static checkLabelNameConsistencyIssue(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements with both visible text and aria-label
		if (trimmedLine.includes('aria-label=') && 
			(trimmedLine.includes('<button') || trimmedLine.includes('<a') || trimmedLine.includes('<input'))) {
			
			// Extract visible text content
			let visibleText = '';
			if (trimmedLine.includes('<button')) {
				const buttonMatch = trimmedLine.match(/<button[^>]*>(.*?)<\/button>/);
				if (buttonMatch) {
					visibleText = buttonMatch[1].trim();
				}
			} else if (trimmedLine.includes('<a')) {
				const linkMatch = trimmedLine.match(/<a[^>]*>(.*?)<\/a>/);
				if (linkMatch) {
					visibleText = linkMatch[1].trim();
				}
			}
			
			// Extract aria-label value
			const ariaLabelMatch = trimmedLine.match(/aria-label=["']([^"']+)["']/);
			if (ariaLabelMatch && visibleText) {
				const ariaLabelValue = ariaLabelMatch[1].trim();
				
				// Check if aria-label contains the visible text
				if (!ariaLabelValue.toLowerCase().includes(visibleText.toLowerCase()) &&
					!visibleText.toLowerCase().includes(ariaLabelValue.toLowerCase())) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: 'Label-name inconsistency - aria-label should contain the visible text or be consistent with it',
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing accessible names on interactive elements
	 */
	static checkMissingAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for interactive elements without accessible names
		if ((trimmedLine.includes('<button') || trimmedLine.includes('<a') || trimmedLine.includes('<input')) &&
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby') &&
			!trimmedLine.includes('title=')) {
			
			// Check for visible text content
			let hasVisibleText = false;
			if (trimmedLine.includes('<button')) {
				const buttonMatch = trimmedLine.match(/<button[^>]*>(.*?)<\/button>/);
				if (buttonMatch && buttonMatch[1].trim().length > 0) {
					hasVisibleText = true;
				}
			} else if (trimmedLine.includes('<a')) {
				const linkMatch = trimmedLine.match(/<a[^>]*>(.*?)<\/a>/);
				if (linkMatch && linkMatch[1].trim().length > 0) {
					hasVisibleText = true;
				}
			}
			
			if (!hasVisibleText) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Interactive element missing accessible name - add aria-label, aria-labelledby, or visible text',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for redundant accessible names
	 */
	static checkRedundantAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements with both aria-label and visible text that are the same
		if (trimmedLine.includes('aria-label=') && 
			(trimmedLine.includes('<button') || trimmedLine.includes('<a'))) {
			
			// Extract visible text content
			let visibleText = '';
			if (trimmedLine.includes('<button')) {
				const buttonMatch = trimmedLine.match(/<button[^>]*>(.*?)<\/button>/);
				if (buttonMatch) {
					visibleText = buttonMatch[1].trim();
				}
			} else if (trimmedLine.includes('<a')) {
				const linkMatch = trimmedLine.match(/<a[^>]*>(.*?)<\/a>/);
				if (linkMatch) {
					visibleText = linkMatch[1].trim();
				}
			}
			
			// Extract aria-label value
			const ariaLabelMatch = trimmedLine.match(/aria-label=["']([^"']+)["']/);
			if (ariaLabelMatch && visibleText) {
				const ariaLabelValue = ariaLabelMatch[1].trim();
				
				// Check if they are exactly the same
				if (ariaLabelValue.toLowerCase() === visibleText.toLowerCase()) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: 'Redundant accessible name - aria-label is identical to visible text',
						severity: 'MEDIUM',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for conflicting accessible names
	 */
	static checkConflictingAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements with both aria-label and aria-labelledby
		if (trimmedLine.includes('aria-label=') && trimmedLine.includes('aria-labelledby=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Conflicting accessible names - element has both aria-label and aria-labelledby',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for empty accessible names
	 */
	static checkEmptyAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for empty aria-label
		if (trimmedLine.includes('aria-label=""') || trimmedLine.includes("aria-label=''") ||
			trimmedLine.includes('aria-label=" "') || trimmedLine.includes("aria-label=' '")) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Empty accessible name - aria-label is empty or contains only whitespace',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for accessible names on non-interactive elements
	 */
	static checkAccessibleNamesOnNonInteractive(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for aria-label on non-interactive elements
		if (trimmedLine.includes('aria-label=') && 
			(trimmedLine.includes('<div') || trimmedLine.includes('<span') || trimmedLine.includes('<p')) &&
			!trimmedLine.includes('role=') && !trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Non-interactive element with aria-label - add role attribute or use semantic element',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing accessible names on form elements
	 */
	static checkFormElementAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for form elements without accessible names
		if ((trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea')) &&
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby') &&
			!trimmedLine.includes('title=') && !trimmedLine.includes('placeholder=')) {
			
			// Check for associated label
			if (!trimmedLine.includes('id=') || !trimmedLine.includes('for=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Form element missing accessible name - add label, aria-label, or aria-labelledby',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for accessible names on custom controls
	 */
	static checkCustomControlAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for custom controls with roles but no accessible names
		if (trimmedLine.includes('role=') && 
			(trimmedLine.includes('role="button"') || trimmedLine.includes('role="link"') ||
			 trimmedLine.includes('role="menuitem"') || trimmedLine.includes('role="tab"') ||
			 trimmedLine.includes('role="option"') || trimmedLine.includes('role="checkbox"')) &&
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby')) {
			
			// Check for visible text content
			let hasVisibleText = false;
			if (trimmedLine.includes('>') && trimmedLine.includes('</')) {
				const textMatch = trimmedLine.match(/>([^<]+)</);
				if (textMatch && textMatch[1].trim().length > 0) {
					hasVisibleText = true;
				}
			}
			
			if (!hasVisibleText) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Custom control missing accessible name - add aria-label, aria-labelledby, or visible text',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for accessible names on images
	 */
	static checkImageAccessibleNames(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for images without accessible names
		if (trimmedLine.includes('<img') && 
			!trimmedLine.includes('alt=') && !trimmedLine.includes('aria-label=') &&
			!trimmedLine.includes('aria-labelledby=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Image missing accessible name - add alt, aria-label, or aria-labelledby',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all label-name consistency accessibility checks
	 */
	static checkLabelNameConsistency(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkLabelNameConsistencyIssue(line, lineNumber),
			this.checkMissingAccessibleNames(line, lineNumber),
			this.checkRedundantAccessibleNames(line, lineNumber),
			this.checkConflictingAccessibleNames(line, lineNumber),
			this.checkEmptyAccessibleNames(line, lineNumber),
			this.checkAccessibleNamesOnNonInteractive(line, lineNumber),
			this.checkFormElementAccessibleNames(line, lineNumber),
			this.checkCustomControlAccessibleNames(line, lineNumber),
			this.checkImageAccessibleNames(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
