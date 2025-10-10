import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class SemanticHtmlChecker {
	/**
	 * Check for missing or incorrect heading hierarchy (MANDATORY)
	 */
	static checkHeadingHierarchy(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for multiple h1 tags (MANDATORY - WCAG 2.1)
		if (trimmedLine.includes('<h1>')) {
			const h1Count = (fullText.match(/<h1[^>]*>/g) || []).length;
			if (h1Count > 1) {
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Multiple h1 tags found - page should have only one h1 for proper document structure',
					severity: 'HIGH',
					range: range
				};
			}
		}

		// Check for skipped heading levels (HIGH PRIORITY)
		const headingMatch = trimmedLine.match(/<h([1-6])[^>]*>/);
		if (headingMatch) {
			const currentLevel = parseInt(headingMatch[1]);
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			
			// This is a simplified check - in a real implementation, you'd track the previous heading level
			if (currentLevel > 1) {
				return {
					line: lineNumber + 1,
					issue: `Heading h${currentLevel} detected - ensure proper heading hierarchy (h1 → h2 → h3, etc.)`,
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing lang attribute on html tag (MANDATORY - WCAG 2.1)
	 */
	static checkHtmlLangAttribute(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<html') && !trimmedLine.includes('lang=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Missing lang attribute on html tag - required for screen readers and language detection',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper list structure (HIGH PRIORITY)
	 */
	static checkListStructure(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for li without ul/ol parent
		if (trimmedLine.includes('<li>') && !trimmedLine.includes('<ul') && !trimmedLine.includes('<ol')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'List item (li) found without proper list container (ul/ol)',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for nested lists without proper structure
		if (trimmedLine.includes('<ul') && trimmedLine.includes('<ol')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Mixed list types (ul and ol) in same line - ensure proper nesting',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper table structure (HIGH PRIORITY)
	 */
	static checkTableStructure(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for td without table structure
		if (trimmedLine.includes('<td>') && !trimmedLine.includes('<table') && !trimmedLine.includes('<tr')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Table cell (td) found without proper table structure (table > tr > td)',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for th without table structure
		if (trimmedLine.includes('<th>') && !trimmedLine.includes('<table') && !trimmedLine.includes('<tr')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Table header (th) found without proper table structure (table > tr > th)',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for missing caption or summary
		if (trimmedLine.includes('<table') && !trimmedLine.includes('caption') && !trimmedLine.includes('summary')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Table missing caption or summary - add caption for table description',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper form structure (MANDATORY)
	 */
	static checkFormStructure(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for form inputs without labels
		if ((trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea')) && 
			!trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby') && 
			!trimmedLine.includes('<label')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Form control missing label - add label, aria-label, or aria-labelledby',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for fieldset without legend
		if (trimmedLine.includes('<fieldset') && !trimmedLine.includes('<legend')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Fieldset missing legend - add legend to describe fieldset purpose',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper button usage (HIGH PRIORITY)
	 */
	static checkButtonUsage(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for div/span with onclick instead of button
		if ((trimmedLine.includes('<div') || trimmedLine.includes('<span')) && 
			trimmedLine.includes('onclick') && !trimmedLine.includes('role="button"')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Use semantic button element instead of div/span with onclick for better accessibility',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for button without accessible text
		if (trimmedLine.includes('<button') && 
			!trimmedLine.includes('aria-label') && 
			!trimmedLine.includes('aria-labelledby') && 
			!trimmedLine.match(/<button[^>]*>.*<\/button>/)) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Button missing accessible text - add text content or aria-label',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper link usage (HIGH PRIORITY)
	 */
	static checkLinkUsage(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for links without accessible text
		if (trimmedLine.includes('<a') && 
			!trimmedLine.includes('aria-label') && 
			!trimmedLine.includes('aria-labelledby') && 
			!trimmedLine.match(/<a[^>]*>.*<\/a>/)) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Link missing accessible text - add text content or aria-label',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for links with generic text
		if (trimmedLine.includes('<a') && 
			(trimmedLine.includes('>click here<') || trimmedLine.includes('>read more<') || 
			 trimmedLine.includes('>here<') || trimmedLine.includes('>more<'))) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Link text is not descriptive - use meaningful link text instead of "click here" or "read more"',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper landmark usage (HIGH PRIORITY)
	 */
	static checkLandmarkUsage(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for missing main landmark
		if (trimmedLine.includes('<body') && !trimmedLine.includes('role="main"') && !trimmedLine.includes('<main')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Page missing main landmark - add <main> or role="main" for primary content',
				severity: 'MEDIUM',
				range: range
			};
		}

		// Check for multiple main landmarks
		if (trimmedLine.includes('<main') || trimmedLine.includes('role="main"')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Main landmark detected - ensure only one main landmark per page',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper sectioning elements (MEDIUM PRIORITY)
	 */
	static checkSectioningElements(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for section/article without heading
		if ((trimmedLine.includes('<section') || trimmedLine.includes('<article')) && 
			!trimmedLine.includes('<h1') && !trimmedLine.includes('<h2') && !trimmedLine.includes('<h3') && 
			!trimmedLine.includes('<h4') && !trimmedLine.includes('<h5') && !trimmedLine.includes('<h6')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Section/article should have a heading to describe its purpose',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper navigation structure (MEDIUM PRIORITY)
	 */
	static checkNavigationStructure(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for nav without list structure
		if (trimmedLine.includes('<nav') && !trimmedLine.includes('<ul') && !trimmedLine.includes('<ol')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Navigation should use list structure (ul/ol) for better screen reader support',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for proper document structure (MANDATORY)
	 */
	static checkDocumentStructure(line: string, lineNumber: number, fullText: string): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for missing title
		if (trimmedLine.includes('<head') && !fullText.includes('<title>')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Document missing title element - add <title> for page identification',
				severity: 'HIGH',
				range: range
			};
		}

		// Check for missing viewport meta tag
		if (trimmedLine.includes('<head') && !fullText.includes('viewport')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Missing viewport meta tag - add for responsive design and mobile accessibility',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all semantic HTML checks
	 */
	static checkSemanticHtml(line: string, lineNumber: number, fullText: string): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkHeadingHierarchy(line, lineNumber, fullText),
			this.checkHtmlLangAttribute(line, lineNumber),
			this.checkListStructure(line, lineNumber),
			this.checkTableStructure(line, lineNumber),
			this.checkFormStructure(line, lineNumber),
			this.checkButtonUsage(line, lineNumber),
			this.checkLinkUsage(line, lineNumber),
			this.checkLandmarkUsage(line, lineNumber),
			this.checkSectioningElements(line, lineNumber),
			this.checkNavigationStructure(line, lineNumber),
			this.checkDocumentStructure(line, lineNumber, fullText)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
