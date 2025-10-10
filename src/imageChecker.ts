import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';

export class ImageChecker {
	/**
	 * Check for missing alt attributes on images
	 */
	static checkImageAltAttributes(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('<img') && !trimmedLine.includes('alt=')) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Missing alt attribute on image....',
				severity: 'HIGH',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Check for empty alt attributes
	 */
	static checkEmptyAltAttributes(line: string, lineNumber: number): AccessibilityIssue | null {
		const trimmedLine = line.trim();
		
		if (trimmedLine.includes('alt=""') || trimmedLine.includes("alt=''")) {
			const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
			return {
				line: lineNumber + 1,
				issue: 'Empty alt attribute - consider if image is decorative or needs description',
				severity: 'MEDIUM',
				range: range
			};
		}
		
		return null;
	}

	/**
	 * Run all image-related accessibility checks
	 */
	static checkImages(line: string, lineNumber: number): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];
		
		const checks = [
			this.checkImageAltAttributes(line, lineNumber),
			this.checkEmptyAltAttributes(line, lineNumber)
		];

		checks.forEach(check => {
			if (check) {
				issues.push(check);
			}
		});

		return issues;
	}
}
