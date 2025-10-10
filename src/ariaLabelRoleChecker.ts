import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class AriaLabelRoleChecker {
	// Valid ARIA roles for WCAG 2.1 compliance
	private static readonly VALID_ROLES = [
		'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
		'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 'directory',
		'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
		'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
		'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
		'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
		'search', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
		'tabpanel', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
	];

	// Interactive elements that should have accessible names
	private static readonly INTERACTIVE_ELEMENTS = [
		'button', 'input', 'select', 'textarea', 'a', 'area', 'summary'
	];

	// Elements that should not have redundant roles
	private static readonly SEMANTIC_ELEMENTS = [
		'button', 'input', 'select', 'textarea', 'a', 'nav', 'main', 'header', 'footer', 'section', 'article', 'aside'
	];

	/**
	 * Check for missing aria-label on interactive elements
	 */
	static checkMissingAriaLabel(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for interactive elements without accessible names
		const hasInteractiveElement = this.INTERACTIVE_ELEMENTS.some(element => 
			trimmedLine.includes(`<${element}`) || trimmedLine.includes(`<${element} `)
		);
		
		if (hasInteractiveElement) {
			// Check for ARIA attributes first
			const hasAriaLabel = trimmedLine.includes('aria-label') || trimmedLine.includes('aria-labelledby');
			const hasTitle = trimmedLine.includes('title=');
			const hasAlt = trimmedLine.includes('alt=');
			
			// Check for visible text content in buttons and links
			let hasVisibleText = false;
			if (trimmedLine.includes('<button')) {
				// Extract content between <button> and </button>
				const buttonMatch = trimmedLine.match(/<button[^>]*>(.*?)<\/button>/);
				if (buttonMatch && buttonMatch[1].trim().length > 0) {
					hasVisibleText = true;
				}
			}
			if (trimmedLine.includes('<a')) {
				// Extract content between <a> and </a>
				const linkMatch = trimmedLine.match(/<a[^>]*>(.*?)<\/a>/);
				if (linkMatch && linkMatch[1].trim().length > 0) {
					hasVisibleText = true;
				}
			}
			
			const hasAccessibleName = hasAriaLabel || hasTitle || hasAlt || hasVisibleText;
			
			if (!hasAccessibleName) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Interactive element missing accessible name (aria-label, aria-labelledby, or visible text)',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for empty or whitespace-only aria-label
	 */
	static checkEmptyAriaLabel(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-label=""') || trimmedLine.includes("aria-label=''") ||
			trimmedLine.includes('aria-label=" "') || trimmedLine.includes("aria-label=' '")) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Empty or whitespace-only aria-label provides no accessible name',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for redundant aria-label when visible text exists
	 */
	static checkRedundantAriaLabel(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for buttons and links with both aria-label and visible text
		if ((trimmedLine.includes('<button') || trimmedLine.includes('<a')) && 
			trimmedLine.includes('aria-label') && 
			trimmedLine.includes('>') && 
			trimmedLine.includes('</')) {
			
			// Extract text content between tags
			const textMatch = trimmedLine.match(/>([^<]+)</);
			if (textMatch && textMatch[1].trim().length > 0) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Redundant aria-label when visible text already provides accessible name',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for invalid ARIA roles
	 */
	static checkInvalidRole(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('role=')) {
			const roleMatch = trimmedLine.match(/role=["']([^"']+)["']/);
			if (roleMatch) {
				const role = roleMatch[1].toLowerCase();
				if (!this.VALID_ROLES.includes(role)) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `Invalid ARIA role "${role}" - not a valid ARIA role`,
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for redundant roles on semantic elements
	 */
	static checkRedundantRole(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('role=')) {
			const roleMatch = trimmedLine.match(/role=["']([^"']+)["']/);
			if (roleMatch) {
				const role = roleMatch[1].toLowerCase();
				
				// Check for redundant roles
				if ((trimmedLine.includes('<button') && role === 'button') ||
					(trimmedLine.includes('<nav') && role === 'navigation') ||
					(trimmedLine.includes('<main') && role === 'main') ||
					(trimmedLine.includes('<header') && role === 'banner') ||
					(trimmedLine.includes('<footer') && role === 'contentinfo') ||
					(trimmedLine.includes('<section') && role === 'region') ||
					(trimmedLine.includes('<article') && role === 'article') ||
					(trimmedLine.includes('<aside') && role === 'complementary')) {
					
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `Redundant role="${role}" on semantic element - element already has implicit role`,
						severity: 'LOW',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing aria-labelledby reference
	 */
	static checkMissingAriaLabelledbyReference(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-labelledby=')) {
			const labelledbyMatch = trimmedLine.match(/aria-labelledby=["']([^"']+)["']/);
			if (labelledbyMatch) {
				const referencedId = labelledbyMatch[1];
				// Check if the referenced element exists in the document
				if (!fullText.includes(`id="${referencedId}"`) && !fullText.includes(`id='${referencedId}'`)) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `aria-labelledby references non-existent element with id="${referencedId}"`,
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing aria-describedby reference
	 */
	static checkMissingAriaDescribedbyReference(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-describedby=')) {
			const describedbyMatch = trimmedLine.match(/aria-describedby=["']([^"']+)["']/);
			if (describedbyMatch) {
				const referencedId = describedbyMatch[1];
				// Check if the referenced element exists in the document
				if (!fullText.includes(`id="${referencedId}"`) && !fullText.includes(`id='${referencedId}'`)) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `aria-describedby references non-existent element with id="${referencedId}"`,
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing aria-expanded on collapsible elements
	 */
	static checkMissingAriaExpanded(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for elements that should have aria-expanded
		if ((trimmedLine.includes('role="button"') || trimmedLine.includes('role="menuitem"')) &&
			trimmedLine.includes('onclick') && !trimmedLine.includes('aria-expanded')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Collapsible element missing aria-expanded attribute',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for incorrect aria-expanded values
	 */
	static checkIncorrectAriaExpanded(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-expanded=')) {
			const expandedMatch = trimmedLine.match(/aria-expanded=["']([^"']+)["']/);
			if (expandedMatch) {
				const value = expandedMatch[1].toLowerCase();
				if (value !== 'true' && value !== 'false') {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `Invalid aria-expanded value "${value}" - must be "true" or "false"`,
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing aria-hidden on decorative elements
	 */
	static checkMissingAriaHiddenOnDecorative(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for decorative images without aria-hidden
		if (trimmedLine.includes('<img') && 
			(trimmedLine.includes('decorative') || trimmedLine.includes('ornament') || 
			 trimmedLine.includes('spacer') || trimmedLine.includes('divider')) &&
			!trimmedLine.includes('aria-hidden="true"')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Decorative image should have aria-hidden="true"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for conflicting aria-hidden and role
	 */
	static checkConflictingAriaHiddenAndRole(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('aria-hidden="true"') && trimmedLine.includes('role=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Element with aria-hidden="true" should not have a role attribute',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing aria-disabled on disabled elements
	 */
	static checkMissingAriaDisabled(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('disabled') || trimmedLine.includes('readonly')) &&
			!trimmedLine.includes('aria-disabled') && 
			(trimmedLine.includes('<input') || trimmedLine.includes('<button') || trimmedLine.includes('<select'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Disabled element should have aria-disabled="true" for screen readers',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing aria-required on required form elements
	 */
	static checkMissingAriaRequired(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('required') || trimmedLine.includes('aria-required="true"')) &&
			!trimmedLine.includes('aria-required') &&
			(trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Required form element should have aria-required="true"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for missing aria-invalid on form validation
	 */
	static checkMissingAriaInvalid(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if ((trimmedLine.includes('error') || trimmedLine.includes('invalid') || trimmedLine.includes('class="error"')) &&
			!trimmedLine.includes('aria-invalid') &&
			(trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Form element with validation error should have aria-invalid="true"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for empty button elements without accessible names
	 */
	static checkEmptyButtonElements(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for empty button elements
		if (trimmedLine.includes('<button') && trimmedLine.includes('</button>')) {
			const buttonMatch = trimmedLine.match(/<button[^>]*>(.*?)<\/button>/);
			if (buttonMatch) {
				const content = buttonMatch[1].trim();
				// Check if button is empty or has only whitespace
				if (content.length === 0 || /^\s*$/.test(content)) {
					// Check if it has any accessible name
					const hasAccessibleName = trimmedLine.includes('aria-label') || 
											trimmedLine.includes('aria-labelledby') ||
											trimmedLine.includes('title=');
					
					if (!hasAccessibleName) {
						const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
						return {
							line: lineNumber + 1,
							issue: 'Empty button element needs accessible name (aria-label, aria-labelledby, or visible text)',
							severity: 'HIGH',
							range: range
						};
					}
				}
			}
		}
		
		return null;
	}

	/**
	 * Run all aria-label and role accessibility checks
	 */
	static checkAriaLabelAndRole(line: string, lineNumber: number, fullText: string): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkMissingAriaLabel(line, lineNumber),
			this.checkEmptyAriaLabel(line, lineNumber),
			this.checkRedundantAriaLabel(line, lineNumber),
			this.checkInvalidRole(line, lineNumber),
			this.checkRedundantRole(line, lineNumber),
			this.checkMissingAriaLabelledbyReference(line, lineNumber, fullText),
			this.checkMissingAriaDescribedbyReference(line, lineNumber, fullText),
			this.checkMissingAriaExpanded(line, lineNumber),
			this.checkIncorrectAriaExpanded(line, lineNumber),
			this.checkMissingAriaHiddenOnDecorative(line, lineNumber),
			this.checkConflictingAriaHiddenAndRole(line, lineNumber),
			this.checkMissingAriaDisabled(line, lineNumber),
			this.checkMissingAriaRequired(line, lineNumber),
			this.checkMissingAriaInvalid(line, lineNumber),
			this.checkEmptyButtonElements(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
