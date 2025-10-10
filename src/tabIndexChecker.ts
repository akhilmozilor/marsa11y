import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class TabIndexChecker {
	// Elements that are naturally focusable
	private static readonly NATURALLY_FOCUSABLE = [
		'button', 'input', 'select', 'textarea', 'a', 'area', 'summary', 'details'
	];

	// Elements that should not be focusable
	private static readonly NON_FOCUSABLE = [
		'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'br', 'hr'
	];

	// Elements that should have tabindex="0" for keyboard accessibility
	private static readonly SHOULD_BE_FOCUSABLE = [
		'div[role="button"]', 'div[role="link"]', 'div[role="menuitem"]', 
		'div[role="tab"]', 'div[role="option"]', 'div[role="checkbox"]',
		'span[role="button"]', 'span[role="link"]', 'span[role="menuitem"]',
		'span[role="tab"]', 'span[role="option"]', 'span[role="checkbox"]'
	];

	/**
	 * Check for negative tabindex values (HIGH priority - mandatory)
	 */
	static checkNegativeTabIndex(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for tabindex="-1" or other negative values
		const negativeTabIndexMatch = trimmedLine.match(/tabindex=["'](-[0-9]+)["']/);
		if (negativeTabIndexMatch) {
			const tabIndexValue = negativeTabIndexMatch[1];
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: `Negative tabindex="${tabIndexValue}" removes element from tab order - ensure this is intentional`,
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex="0" on non-interactive elements (HIGH priority - mandatory)
	 */
	static checkTabIndexZeroOnNonInteractive(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('tabindex="0"') || trimmedLine.includes("tabindex='0'")) {
			// Check if element is naturally non-interactive
			const isNonInteractive = this.NON_FOCUSABLE.some(element => 
				trimmedLine.includes(`<${element}`) && !trimmedLine.includes('role=')
			);
			
			if (isNonInteractive) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Non-interactive element with tabindex="0" - add role attribute or use semantic element',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing tabindex on custom interactive elements (HIGH priority - mandatory)
	 */
	static checkMissingTabIndexOnCustomInteractive(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for div/span with interactive roles but no tabindex
		const hasInteractiveRole = trimmedLine.includes('role="button"') || 
								  trimmedLine.includes('role="link"') ||
								  trimmedLine.includes('role="menuitem"') ||
								  trimmedLine.includes('role="tab"') ||
								  trimmedLine.includes('role="option"') ||
								  trimmedLine.includes('role="checkbox"');
		
		if (hasInteractiveRole && !trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Custom interactive element missing tabindex - add tabindex="0" for keyboard accessibility',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on naturally focusable elements (MEDIUM priority)
	 */
	static checkRedundantTabIndexOnFocusable(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for naturally focusable elements with explicit tabindex
		const isNaturallyFocusable = this.NATURALLY_FOCUSABLE.some(element => 
			trimmedLine.includes(`<${element}`)
		);
		
		if (isNaturallyFocusable && trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Redundant tabindex on naturally focusable element - remove unless changing tab order',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex values greater than 0 (MEDIUM priority)
	 */
	static checkPositiveTabIndex(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for tabindex values > 0
		const positiveTabIndexMatch = trimmedLine.match(/tabindex=["']([1-9][0-9]*)["']/);
		if (positiveTabIndexMatch) {
			const tabIndexValue = positiveTabIndexMatch[1];
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: `Positive tabindex="${tabIndexValue}" disrupts natural tab order - use tabindex="0" or negative values only`,
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing tabindex on clickable elements (MEDIUM priority)
	 */
	static checkMissingTabIndexOnClickable(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements with onclick but no tabindex
		if ((trimmedLine.includes('onclick') || trimmedLine.includes('onkeydown')) && 
			!trimmedLine.includes('tabindex=') && 
			(trimmedLine.includes('<div') || trimmedLine.includes('<span'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Clickable element missing tabindex - add tabindex="0" for keyboard accessibility',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for disabled elements with tabindex (MEDIUM priority)
	 */
	static checkDisabledElementWithTabIndex(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('disabled') || trimmedLine.includes('aria-disabled="true"')) && 
			trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Disabled element should not be focusable - remove tabindex or use tabindex="-1"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on hidden elements (MEDIUM priority)
	 */
	static checkTabIndexOnHiddenElement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('hidden') || trimmedLine.includes('aria-hidden="true"') || 
			 trimmedLine.includes('style="display: none"') || trimmedLine.includes('style="visibility: hidden"')) &&
			trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Hidden element should not be focusable - remove tabindex or use tabindex="-1"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on decorative elements (LOW priority)
	 */
	static checkTabIndexOnDecorativeElement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for decorative images or elements with tabindex
		if ((trimmedLine.includes('decorative') || trimmedLine.includes('ornament') || 
			 trimmedLine.includes('spacer') || trimmedLine.includes('divider')) &&
			trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Decorative element should not be focusable - remove tabindex or use tabindex="-1"',
				severity: 'LOW',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for inconsistent tabindex usage (LOW priority)
	 */
	static checkInconsistentTabIndexUsage(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for mixed tabindex values in same context
		if (trimmedLine.includes('tabindex=')) {
			const tabIndexMatch = trimmedLine.match(/tabindex=["']([^"']+)["']/);
			if (tabIndexMatch) {
				const tabIndexValue = tabIndexMatch[1];
				// Check for unusual patterns
				if (tabIndexValue === '1' || tabIndexValue === '2' || tabIndexValue === '3') {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `Low positive tabindex="${tabIndexValue}" may cause confusion - consider using tabindex="0" or negative values`,
						severity: 'LOW',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing tabindex on modal triggers (MEDIUM priority)
	 */
	static checkMissingTabIndexOnModalTrigger(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements that might trigger modals
		if ((trimmedLine.includes('data-toggle="modal"') || 
			 trimmedLine.includes('data-bs-toggle="modal"') ||
			 trimmedLine.includes('onclick') && trimmedLine.includes('modal')) &&
			!trimmedLine.includes('tabindex=') &&
			(trimmedLine.includes('<div') || trimmedLine.includes('<span'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Modal trigger element missing tabindex - add tabindex="0" for keyboard accessibility',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on elements with role="presentation" (HIGH priority)
	 */
	static checkTabIndexOnPresentationRole(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('role="presentation"') && trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Element with role="presentation" should not be focusable - remove tabindex',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on elements with role="none" (HIGH priority)
	 */
	static checkTabIndexOnNoneRole(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('role="none"') && trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Element with role="none" should not be focusable - remove tabindex',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on elements with aria-hidden="true" (HIGH priority)
	 */
	static checkTabIndexOnAriaHidden(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-hidden="true"') && trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Element with aria-hidden="true" should not be focusable - remove tabindex',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing tabindex on custom form controls (MEDIUM priority)
	 */
	static checkMissingTabIndexOnCustomFormControl(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for custom form controls
		if ((trimmedLine.includes('role="combobox"') || 
			 trimmedLine.includes('role="slider"') ||
			 trimmedLine.includes('role="spinbutton"')) &&
			!trimmedLine.includes('tabindex=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Custom form control missing tabindex - add tabindex="0" for keyboard accessibility',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for tabindex on elements that should not be interactive (LOW priority)
	 */
	static checkTabIndexOnNonInteractiveElement(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements that should not be interactive
		if ((trimmedLine.includes('<p') || trimmedLine.includes('<h1') || 
			 trimmedLine.includes('<h2') || trimmedLine.includes('<h3') ||
			 trimmedLine.includes('<h4') || trimmedLine.includes('<h5') ||
			 trimmedLine.includes('<h6') || trimmedLine.includes('<img')) &&
			trimmedLine.includes('tabindex=') && !trimmedLine.includes('role=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Non-interactive element with tabindex - consider if this element should be focusable',
				severity: 'LOW',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all tab index accessibility checks
	 */
	static checkTabIndex(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			// HIGH priority - mandatory checks
			this.checkNegativeTabIndex(line, lineNumber),
			this.checkTabIndexZeroOnNonInteractive(line, lineNumber),
			this.checkMissingTabIndexOnCustomInteractive(line, lineNumber),
			this.checkTabIndexOnPresentationRole(line, lineNumber),
			this.checkTabIndexOnNoneRole(line, lineNumber),
			this.checkTabIndexOnAriaHidden(line, lineNumber),
			
			// MEDIUM priority checks
			this.checkRedundantTabIndexOnFocusable(line, lineNumber),
			this.checkPositiveTabIndex(line, lineNumber),
			this.checkMissingTabIndexOnClickable(line, lineNumber),
			this.checkDisabledElementWithTabIndex(line, lineNumber),
			this.checkTabIndexOnHiddenElement(line, lineNumber),
			this.checkMissingTabIndexOnModalTrigger(line, lineNumber),
			this.checkMissingTabIndexOnCustomFormControl(line, lineNumber),
			
			// LOW priority checks
			this.checkTabIndexOnDecorativeElement(line, lineNumber),
			this.checkInconsistentTabIndexUsage(line, lineNumber),
			this.checkTabIndexOnNonInteractiveElement(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
