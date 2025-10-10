import * as assert from 'assert';
import { SemanticHtmlChecker } from '../semanticHtmlChecker';

suite('SemanticHtmlChecker Test Suite', () => {
	test('Should detect missing lang attribute on html tag', () => {
		const line = '<html>';
		const result = SemanticHtmlChecker.checkHtmlLangAttribute(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Missing lang attribute'), true);
		assert.strictEqual(result?.severity, 'HIGH');
	});

	test('Should not flag html with lang attribute', () => {
		const line = '<html lang="en">';
		const result = SemanticHtmlChecker.checkHtmlLangAttribute(line, 0);
		
		assert.strictEqual(result, null);
	});

	test('Should detect li without ul/ol', () => {
		const line = '<li>Item</li>';
		const result = SemanticHtmlChecker.checkListStructure(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('List item (li) found without proper list container'), true);
	});

	test('Should not flag proper list structure', () => {
		const line = '<ul><li>Item</li></ul>';
		const result = SemanticHtmlChecker.checkListStructure(line, 0);
		
		assert.strictEqual(result, null);
	});

	test('Should detect td without table structure', () => {
		const line = '<td>Cell</td>';
		const result = SemanticHtmlChecker.checkTableStructure(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Table cell (td) found without proper table structure'), true);
	});

	test('Should detect missing caption in table', () => {
		const line = '<table>';
		const result = SemanticHtmlChecker.checkTableStructure(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Table missing caption or summary'), true);
	});

	test('Should detect input without label', () => {
		const line = '<input type="text" />';
		const result = SemanticHtmlChecker.checkFormStructure(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Form control missing label'), true);
	});

	test('Should detect fieldset without legend', () => {
		const line = '<fieldset>';
		const result = SemanticHtmlChecker.checkFormStructure(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Fieldset missing legend'), true);
	});

	test('Should detect div with onclick instead of button', () => {
		const line = '<div onclick="doSomething()">Click me</div>';
		const result = SemanticHtmlChecker.checkButtonUsage(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Use semantic button element instead of div/span with onclick'), true);
	});

	test('Should detect button without accessible text', () => {
		const line = '<button></button>';
		const result = SemanticHtmlChecker.checkButtonUsage(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Button missing accessible text'), true);
	});

	test('Should detect link without accessible text', () => {
		const line = '<a href="#"></a>';
		const result = SemanticHtmlChecker.checkLinkUsage(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Link missing accessible text'), true);
	});

	test('Should detect generic link text', () => {
		const line = '<a href="#">click here</a>';
		const result = SemanticHtmlChecker.checkLinkUsage(line, 0);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Link text is not descriptive'), true);
	});

	test('Should run all semantic HTML checks', () => {
		const line = '<html>';
		const fullText = '<html><body></body></html>';
		const results = SemanticHtmlChecker.checkSemanticHtml(line, 0, fullText);
		
		assert.strictEqual(results.length > 0, true);
		assert.strictEqual(results.some(r => r.issue.includes('Missing lang attribute')), true);
	});

	test('Should detect skipped heading levels', () => {
		const line = '<h3>Heading</h3>';
		const fullText = '<h1>Main</h1><h3>Sub</h3>';
		const result = SemanticHtmlChecker.checkHeadingHierarchy(line, 0, fullText);
		
		assert.notStrictEqual(result, null);
		assert.strictEqual(result?.issue.includes('Heading h3 detected'), true);
	});
});
