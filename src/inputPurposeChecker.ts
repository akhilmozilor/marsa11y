import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class InputPurposeChecker {
	// Common autocomplete values for WCAG 1.3.5 - Level AA
	private static readonly AUTOCOMPLETE_VALUES = [
		'name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix',
		'nickname', 'email', 'username', 'new-password', 'current-password', 'one-time-code',
		'organization-title', 'organization', 'street-address', 'address-line1', 'address-line2',
		'address-line3', 'address-level1', 'address-level2', 'address-level3', 'address-level4',
		'country', 'country-name', 'postal-code', 'cc-name', 'cc-given-name', 'cc-additional-name',
		'cc-family-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
		'transaction-currency', 'transaction-amount', 'language', 'bday', 'bday-day', 'bday-month',
		'bday-year', 'sex', 'tel', 'tel-country-code', 'tel-national', 'tel-area-code', 'tel-local',
		'tel-local-prefix', 'tel-local-suffix', 'tel-extension', 'url', 'photo', 'webauthn'
	];

	/**
	 * Check for missing autocomplete attributes (WCAG 1.3.5 - Level AA)
	 */
	static checkMissingAutocomplete(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for form inputs that should have autocomplete
		if ((trimmedLine.includes('<input') || trimmedLine.includes('<select') || trimmedLine.includes('<textarea')) &&
			!trimmedLine.includes('autocomplete=') && 
			!trimmedLine.includes('disabled') && 
			!trimmedLine.includes('readonly')) {
			
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Form input missing autocomplete attribute - add autocomplete for user information fields',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for invalid autocomplete values
	 */
	static checkInvalidAutocomplete(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('autocomplete=')) {
			const autocompleteMatch = trimmedLine.match(/autocomplete=["']([^"']+)["']/);
			if (autocompleteMatch) {
				const value = autocompleteMatch[1];
				if (value !== 'off' && !this.AUTOCOMPLETE_VALUES.includes(value)) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: `Invalid autocomplete value "${value}" - use standard autocomplete values or "off"`,
						severity: 'HIGH',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for input type and autocomplete mismatch
	 */
	static checkInputTypeAutocompleteMismatch(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<input') && trimmedLine.includes('autocomplete=')) {
			const typeMatch = trimmedLine.match(/type=["']([^"']+)["']/);
			const autocompleteMatch = trimmedLine.match(/autocomplete=["']([^"']+)["']/);
			
			if (typeMatch && autocompleteMatch) {
				const inputType = typeMatch[1];
				const autocompleteValue = autocompleteMatch[1];
				
				// Check for mismatches
				if (inputType === 'email' && !autocompleteValue.includes('email')) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: 'Email input should have autocomplete="email" or related email field',
						severity: 'MEDIUM',
						range: range
					};
				}
				
				if (inputType === 'password' && !autocompleteValue.includes('password')) {
					const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
					return {
						line: lineNumber + 1,
						issue: 'Password input should have autocomplete="current-password" or "new-password"',
						severity: 'MEDIUM',
						range: range
					};
				}
			}
		}
		
		return null;
	}

	/**
	 * Check for missing input purpose on personal information fields
	 */
	static checkPersonalInformationFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		// Check for common personal information field patterns
		if (trimmedLine.includes('<input') && 
			(trimmedLine.includes('name=') || trimmedLine.includes('id=')) &&
			!trimmedLine.includes('autocomplete=')) {
			
			const fieldName = trimmedLine.toLowerCase();
			
			// Check for common personal information field names
			if (fieldName.includes('name') || fieldName.includes('email') || fieldName.includes('phone') ||
				fieldName.includes('address') || fieldName.includes('city') || fieldName.includes('state') ||
				fieldName.includes('zip') || fieldName.includes('country') || fieldName.includes('birth') ||
				fieldName.includes('gender') || fieldName.includes('age')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Personal information field missing autocomplete attribute - add appropriate autocomplete value',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing input purpose on financial fields
	 */
	static checkFinancialFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<input') && 
			(trimmedLine.includes('name=') || trimmedLine.includes('id=')) &&
			!trimmedLine.includes('autocomplete=')) {
			
			const fieldName = trimmedLine.toLowerCase();
			
			// Check for financial field patterns
			if (fieldName.includes('card') || fieldName.includes('credit') || fieldName.includes('debit') ||
				fieldName.includes('cvv') || fieldName.includes('cvc') || fieldName.includes('expiry') ||
				fieldName.includes('amount') || fieldName.includes('currency')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Financial field missing autocomplete attribute - add appropriate autocomplete value',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing input purpose on authentication fields
	 */
	static checkAuthenticationFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<input') && 
			(trimmedLine.includes('name=') || trimmedLine.includes('id=')) &&
			!trimmedLine.includes('autocomplete=')) {
			
			const fieldName = trimmedLine.toLowerCase();
			
			// Check for authentication field patterns
			if (fieldName.includes('username') || fieldName.includes('login') || fieldName.includes('password') ||
				fieldName.includes('otp') || fieldName.includes('verification') || fieldName.includes('code')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Authentication field missing autocomplete attribute - add appropriate autocomplete value',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing input purpose on contact fields
	 */
	static checkContactFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<input') && 
			(trimmedLine.includes('name=') || trimmedLine.includes('id=')) &&
			!trimmedLine.includes('autocomplete=')) {
			
			const fieldName = trimmedLine.toLowerCase();
			
			// Check for contact field patterns
			if (fieldName.includes('phone') || fieldName.includes('tel') || fieldName.includes('mobile') ||
				fieldName.includes('fax') || fieldName.includes('website') || fieldName.includes('url')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Contact field missing autocomplete attribute - add appropriate autocomplete value',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for missing input purpose on address fields
	 */
	static checkAddressFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<input') && 
			(trimmedLine.includes('name=') || trimmedLine.includes('id=')) &&
			!trimmedLine.includes('autocomplete=')) {
			
			const fieldName = trimmedLine.toLowerCase();
			
			// Check for address field patterns
			if (fieldName.includes('street') || fieldName.includes('address') || fieldName.includes('city') ||
				fieldName.includes('state') || fieldName.includes('province') || fieldName.includes('zip') ||
				fieldName.includes('postal') || fieldName.includes('country')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'Address field missing autocomplete attribute - add appropriate autocomplete value',
					severity: 'HIGH',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Check for autocomplete="off" on user information fields
	 */
	static checkAutocompleteOffOnUserFields(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('autocomplete="off"') || trimmedLine.includes("autocomplete='off'")) {
			const fieldName = trimmedLine.toLowerCase();
			
			// Check if it's a user information field
			if (fieldName.includes('name') || fieldName.includes('email') || fieldName.includes('phone') ||
				fieldName.includes('address') || fieldName.includes('birth') || fieldName.includes('gender')) {
				
				const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
				return {
					line: lineNumber + 1,
					issue: 'User information field has autocomplete="off" - consider using appropriate autocomplete value',
					severity: 'MEDIUM',
					range: range
				};
			}
		}
		
		return null;
	}

	/**
	 * Run all input purpose accessibility checks
	 */
	static checkInputPurpose(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkMissingAutocomplete(line, lineNumber),
			this.checkInvalidAutocomplete(line, lineNumber),
			this.checkInputTypeAutocompleteMismatch(line, lineNumber),
			this.checkPersonalInformationFields(line, lineNumber),
			this.checkFinancialFields(line, lineNumber),
			this.checkAuthenticationFields(line, lineNumber),
			this.checkContactFields(line, lineNumber),
			this.checkAddressFields(line, lineNumber),
			this.checkAutocompleteOffOnUserFields(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
