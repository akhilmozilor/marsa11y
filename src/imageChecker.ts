import * as vscode from 'vscode';
import { AccessibilityIssue } from './accessibilityChecker';
import { AltTagAutoFixer } from './altTagAutoFixer';

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

	/**
	 * Auto-fix missing alt attributes in the current document
	 */
	static async autoFixMissingAltTags(document: vscode.TextDocument): Promise<void> {
		try {
			// First, check if there are any images with missing alt tags
			const text = document.getText();
			const lines = text.split('\n');
			let missingAltCount = 0;

			for (const line of lines) {
				const trimmedLine = line.trim();
				if (trimmedLine.includes('<img') && !trimmedLine.includes('alt=')) {
					missingAltCount++;
				}
			}

			if (missingAltCount === 0) {
				vscode.window.showInformationMessage('ℹ️ No images with missing alt tags found');
				return;
			}

			// Show progress while generating previews
			const previews = await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Generating alt text previews...",
				cancellable: false
			}, async (progress) => {
				progress.report({ message: "Analyzing images and generating alt text..." });
				return await AltTagAutoFixer.getMissingAltTagsPreview(document);
			});

			if (previews.length === 0) {
				vscode.window.showInformationMessage('ℹ️ No alt text could be generated for the images');
				return;
			}

			// Show preview of generated alt text
			const previewText = previews.map((preview, index) => 
				`${index + 1}. ${preview.imageSrc}\n   → "${preview.altText}"`
			).join('\n\n');

			const confirmMessage = `Generated alt text for ${previews.length} image(s):\n\n${previewText}\n\nDo you want to apply these fixes?`;
			const userChoice = await vscode.window.showInformationMessage(
				confirmMessage,
				'Yes, Apply Fix',
				'Cancel'
			);

			if (userChoice !== 'Yes, Apply Fix') {
				return;
			}

			const edit = await AltTagAutoFixer.autoFixMissingAltTags(document);
			
			if (edit) {
				const success = await vscode.workspace.applyEdit(edit);
				if (success) {
					vscode.window.showInformationMessage('✅ Alt tags auto-fixed successfully!');
				} else {
					vscode.window.showErrorMessage('❌ Failed to apply alt tag fixes');
				}
			} else {
				vscode.window.showInformationMessage('ℹ️ No images with missing alt tags found');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`❌ Auto-fix failed: ${error}`);
		}
	}

	/**
	 * Auto-fix a specific image tag at the given line
	 */
	static async autoFixSpecificImage(document: vscode.TextDocument, lineNumber: number): Promise<void> {
		try {
			const lineText = document.lineAt(lineNumber).text;
			const trimmedLine = lineText.trim();
			
			// Check if there's a fixable image at this line
			if (!trimmedLine.includes('<img') || trimmedLine.includes('alt=')) {
				vscode.window.showInformationMessage('ℹ️ No fixable image found at this line');
				return;
			}

			// Generate preview of alt text
			const preview = await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Generating alt text...",
				cancellable: false
			}, async (progress) => {
				progress.report({ message: "Analyzing image and generating alt text..." });
				return await AltTagAutoFixer.getSpecificImagePreview(document, lineNumber, lineText);
			});

			if (!preview) {
				vscode.window.showInformationMessage('ℹ️ No alt text could be generated for this image');
				return;
			}

			// Show preview of generated alt text
			const confirmMessage = `Generated alt text for "${preview.imageSrc}":\n\n"${preview.altText}"\n\nDo you want to apply this fix?`;
			const userChoice = await vscode.window.showInformationMessage(
				confirmMessage,
				'Yes, Apply Fix',
				'Cancel'
			);

			if (userChoice !== 'Yes, Apply Fix') {
				return;
			}

			const edit = await AltTagAutoFixer.fixSpecificImageTag(document, lineNumber, lineText);
			
			if (edit) {
				const success = await vscode.workspace.applyEdit(edit);
				if (success) {
					vscode.window.showInformationMessage('✅ Alt tag added successfully!');
				} else {
					vscode.window.showErrorMessage('❌ Failed to add alt tag');
				}
			} else {
				vscode.window.showInformationMessage('ℹ️ No fixable image found at this line');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`❌ Auto-fix failed: ${error}`);
		}
	}
}
