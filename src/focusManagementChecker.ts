import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class FocusManagementChecker {
	/**
	 * Check for focus management issues (WCAG 2.4.3 - Level A)
	 */
	static checkFocusOrder(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for positive tabindex values that disrupt focus order
		const positiveTabIndexMatch = trimmedLine.match(/tabindex=["']([1-9][0-9]*)["']/);
		if (positiveTabIndexMatch) {
			const tabIndexValue = positiveTabIndexMatch[1];
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: `Positive tabindex="${tabIndexValue}" disrupts natural focus order - use tabindex="0" or negative values`,
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for focus trap in modals and dialogs
	 */
	static checkFocusTrap(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for modal/dialog elements that need focus management
		if (trimmedLine.includes('role="dialog"') || trimmedLine.includes('role="alertdialog"') ||
			trimmedLine.includes('modal') || trimmedLine.includes('popup')) {
			
			if (!trimmedLine.includes('onkeydown') && !trimmedLine.includes('onkeyup')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Modal/dialog element missing focus trap management - add keyboard handlers for focus control',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing focus indicators
	 */
	static checkMissingFocusIndicators(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for focus styles being removed
		if (trimmedLine.includes(':focus') && 
			(trimmedLine.includes('outline: none') || trimmedLine.includes('outline: 0'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Focus outline removed - ensure alternative focus indicator is provided',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for focus management in dynamic content
	 */
	static checkDynamicFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for dynamic content that might affect focus
		if (trimmedLine.includes('innerHTML') || trimmedLine.includes('appendChild') ||
			trimmedLine.includes('insertBefore') || trimmedLine.includes('replaceChild')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Dynamic content manipulation detected - ensure focus management when content changes',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper focus management in ARIA components
	 */
	static checkAriaFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for ARIA components that need focus management
		if (trimmedLine.includes('role=') && 
			(trimmedLine.includes('role="menu"') || trimmedLine.includes('role="menubar"') ||
			 trimmedLine.includes('role="tablist"') || trimmedLine.includes('role="grid"') ||
			 trimmedLine.includes('role="tree"') || trimmedLine.includes('role="listbox"'))) {
			
			if (!trimmedLine.includes('aria-activedescendant') && !trimmedLine.includes('tabindex=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'ARIA component missing focus management - add aria-activedescendant or proper tabindex',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for focus management in form validation
	 */
	static checkFormFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for form elements with validation that need focus management
		if ((trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea')) &&
			(trimmedLine.includes('error') || trimmedLine.includes('invalid') || trimmedLine.includes('required'))) {
			
			if (!trimmedLine.includes('aria-invalid') && !trimmedLine.includes('aria-describedby')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Form validation missing focus management - add aria-invalid and aria-describedby for error states',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for focus management in single-page applications
	 */
	static checkSPAFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for SPA navigation patterns
		if (trimmedLine.includes('router') || trimmedLine.includes('navigate') ||
			trimmedLine.includes('history.pushState') || trimmedLine.includes('history.replaceState')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'SPA navigation detected - ensure focus management when route changes',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for focus management in collapsible content
	 */
	static checkCollapsibleFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for collapsible content that needs focus management
		if (trimmedLine.includes('aria-expanded') || trimmedLine.includes('collapsible') ||
			trimmedLine.includes('accordion') || trimmedLine.includes('dropdown')) {
			
			if (!trimmedLine.includes('onkeydown') && !trimmedLine.includes('onkeyup')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Collapsible content missing keyboard focus management - add keyboard handlers',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for focus management in data tables
	 */
	static checkTableFocusManagement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for data tables that need focus management
		if (trimmedLine.includes('<table') && 
			(trimmedLine.includes('sortable') || trimmedLine.includes('filterable') || 
			 trimmedLine.includes('editable') || trimmedLine.includes('selectable'))) {
			
			if (!trimmedLine.includes('role=') && !trimmedLine.includes('tabindex=')) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Interactive table missing focus management - add proper ARIA roles and tabindex',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Run all focus management accessibility checks
	 */
	static checkFocusManagement(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkFocusOrder(line, lineNumber),
			this.checkFocusTrap(line, lineNumber),
			this.checkMissingFocusIndicators(line, lineNumber),
			this.checkDynamicFocusManagement(line, lineNumber),
			this.checkAriaFocusManagement(line, lineNumber),
			this.checkFormFocusManagement(line, lineNumber),
			this.checkSPAFocusManagement(line, lineNumber),
			this.checkCollapsibleFocusManagement(line, lineNumber),
			this.checkTableFocusManagement(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
