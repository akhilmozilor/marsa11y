import * as vscode from 'vscode';
import OpenAI from 'openai';

export interface AltFixResult {
	success: boolean;
	altText?: string;
	error?: string;
}

export class AltTagAutoFixer {
	private static openai: OpenAI | null = null;

	/**
	 * Initialize OpenAI client with API key from VS Code settings
	 */
	private static initializeOpenAI(): boolean {
		if (this.openai) {
			return true;
		}

		const config = vscode.workspace.getConfiguration('marsa11yfix');
		const apiKey = config.get<string>('openaiApiKey');
        console.log('apiKey', apiKey);
		if (!apiKey) {
			vscode.window.showErrorMessage(
				'OpenAI API key not found. Please set marsa11yfix.openaiApiKey in your VS Code settings.'
			);
			return false;
		}

		try {
			this.openai = new OpenAI({
				apiKey: apiKey,
			});
			return true;
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to initialize OpenAI client: ${error}`);
			return false;
		}
	}

	/**
	 * Generate alt text for an image using OpenAI
	 */
	static async generateAltText(imageSrc: string, context?: string): Promise<AltFixResult> {
		if (!this.initializeOpenAI()) {
			return {
				success: false,
				error: 'OpenAI not initialized'
			};
		}

		try {
			const prompt = this.buildPrompt(imageSrc, context);
			
			const completion = await this.openai!.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are an accessibility expert. Generate concise, descriptive alt text for images. Keep it under 125 characters. If the image is decorative, return "decorative".'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				max_tokens: 150,
				temperature: 0.3
			});

			const altText = completion.choices[0]?.message?.content?.trim();
			
			if (!altText) {
				return {
					success: false,
					error: 'No alt text generated'
				};
			}

			return {
				success: true,
				altText: altText
			};

		} catch (error) {
			console.error('OpenAI API error:', error);
			return {
				success: false,
				error: `OpenAI API error: ${error}`
			};
		}
	}

	/**
	 * Build prompt for OpenAI based on image source and context
	 */
	private static buildPrompt(imageSrc: string, context?: string): string {
		let prompt = `Generate alt text for this image: ${imageSrc}`;
		
		if (context) {
			prompt += `\n\nContext: ${context}`;
		}
		
		prompt += '\n\nProvide a concise, descriptive alt text that describes what the image shows. If the image is purely decorative, return "decorative".';
		
		return prompt;
	}

	/**
	 * Get preview of alt text that would be generated for missing alt tags
	 */
	static async getMissingAltTagsPreview(document: vscode.TextDocument): Promise<Array<{lineNumber: number, imageSrc: string, altText: string}>> {
		const text = document.getText();
		const lines = text.split('\n');
		const previews: Array<{lineNumber: number, imageSrc: string, altText: string}> = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();

			// Check for img tags without alt attributes
			if (trimmedLine.includes('<img') && !trimmedLine.includes('alt=')) {
				const imgTagMatch = trimmedLine.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
				
				if (imgTagMatch) {
					const imageSrc = imgTagMatch[1];
					
					// Get some context around the image
					const contextLines = lines.slice(Math.max(0, i - 2), i + 3);
					const context = contextLines.join(' ').substring(0, 200);

					const result = await this.generateAltText(imageSrc, context);
					
					if (result.success && result.altText) {
						previews.push({
							lineNumber: i,
							imageSrc: imageSrc,
							altText: result.altText
						});
					}
				}
			}
		}

		return previews;
	}

	/**
	 * Auto-fix missing alt attributes in a document
	 */
	static async autoFixMissingAltTags(document: vscode.TextDocument): Promise<vscode.WorkspaceEdit | null> {
		const text = document.getText();
		const lines = text.split('\n');
		const edit = new vscode.WorkspaceEdit();
		let hasChanges = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();

			// Check for img tags without alt attributes
			if (trimmedLine.includes('<img') && !trimmedLine.includes('alt=')) {
				const imgTagMatch = trimmedLine.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
				
				if (imgTagMatch) {
					const imageSrc = imgTagMatch[1];
					
					// Get some context around the image
					const contextLines = lines.slice(Math.max(0, i - 2), i + 3);
					const context = contextLines.join(' ').substring(0, 200);

					// Show progress
					await vscode.window.withProgress({
						location: vscode.ProgressLocation.Notification,
						title: "Generating alt text...",
						cancellable: false
					}, async (progress) => {
						progress.report({ message: `Processing image: ${imageSrc}` });
						
						const result = await this.generateAltText(imageSrc, context);
						
						if (result.success && result.altText) {
							// Find the position to insert the alt attribute
							const imgTagStart = line.indexOf('<img');
							const imgTagEnd = line.indexOf('>', imgTagStart);
							
							if (imgTagStart !== -1 && imgTagEnd !== -1) {
								const beforeAlt = line.substring(0, imgTagEnd);
								const afterAlt = line.substring(imgTagEnd);
								
								// Insert alt attribute before the closing >
								const newLine = beforeAlt + ` alt="${result.altText}"` + afterAlt;
								
								const range = new vscode.Range(i, 0, i, line.length);
								edit.replace(document.uri, range, newLine);
								hasChanges = true;
							}
						} else {
							console.warn(`Failed to generate alt text for ${imageSrc}: ${result.error}`);
						}
					});
				}
			}
		}

		return hasChanges ? edit : null;
	}

	/**
	 * Get preview of alt text for a specific image tag
	 */
	static async getSpecificImagePreview(
		document: vscode.TextDocument, 
		lineNumber: number, 
		lineText: string
	): Promise<{imageSrc: string, altText: string} | null> {
		const trimmedLine = lineText.trim();
		
		if (!trimmedLine.includes('<img') || trimmedLine.includes('alt=')) {
			return null;
		}

		const imgTagMatch = trimmedLine.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
		
		if (!imgTagMatch) {
			return null;
		}

		const imageSrc = imgTagMatch[1];
		const result = await this.generateAltText(imageSrc);

		if (!result.success || !result.altText) {
			return null;
		}

		return {
			imageSrc: imageSrc,
			altText: result.altText
		};
	}

	/**
	 * Fix a specific image tag with missing alt attribute
	 */
	static async fixSpecificImageTag(
		document: vscode.TextDocument, 
		lineNumber: number, 
		lineText: string
	): Promise<vscode.WorkspaceEdit | null> {
		const trimmedLine = lineText.trim();
		
		if (!trimmedLine.includes('<img') || trimmedLine.includes('alt=')) {
			return null;
		}

		const imgTagMatch = trimmedLine.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
		
		if (!imgTagMatch) {
			return null;
		}

		const imageSrc = imgTagMatch[1];
		const result = await this.generateAltText(imageSrc);

		if (!result.success || !result.altText) {
			vscode.window.showErrorMessage(`Failed to generate alt text: ${result.error}`);
			return null;
		}

		// Find the position to insert the alt attribute
		const imgTagStart = lineText.indexOf('<img');
		const imgTagEnd = lineText.indexOf('>', imgTagStart);
		
		if (imgTagStart === -1 || imgTagEnd === -1) {
			return null;
		}

		const beforeAlt = lineText.substring(0, imgTagEnd);
		const afterAlt = lineText.substring(imgTagEnd);
		
		// Insert alt attribute before the closing >
		const newLine = beforeAlt + ` alt="${result.altText}"` + afterAlt;
		
		const edit = new vscode.WorkspaceEdit();
		const range = new vscode.Range(lineNumber, 0, lineNumber, lineText.length);
		edit.replace(document.uri, range, newLine);

		return edit;
	}
}
