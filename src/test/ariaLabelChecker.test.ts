import * as assert from 'assert';
import { AriaLabelRoleChecker } from '../ariaLabelRoleChecker';

suite('AriaLabelChecker Test Suite', () => {
	test('Should detect missing aria-label on button', () => {
		const line = '<button onclick="doSomething()">Click me</button>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		// This should not trigger an issue since the button has visible text content
		assert.strictEqual(issues.length, 0);
	});

	test('Should detect missing aria-label on button without text', () => {
		const line = '<button onclick="doSomething()"></button>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'Interactive element missing accessible name (aria-label, aria-labelledby, or visible text)');
		assert.strictEqual(issues[0].severity, 'HIGH');
	});

	test('Should detect empty aria-label', () => {
		const line = '<button aria-label="">Click me</button>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'aria-label attribute has empty or whitespace-only value');
		assert.strictEqual(issues[0].severity, 'HIGH');
	});

	test('Should detect generic aria-label', () => {
		const line = '<button aria-label="button">Submit</button>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'aria-label contains generic text - use more descriptive labels');
		assert.strictEqual(issues[0].severity, 'MEDIUM');
	});

	test('Should detect aria-label with placeholder anti-pattern', () => {
		const line = '<input type="text" aria-label="Enter your name" placeholder="Name">';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'Avoid using both aria-label and placeholder - choose one for better UX');
		assert.strictEqual(issues[0].severity, 'MEDIUM');
	});

	test('Should detect aria-label on decorative element', () => {
		const line = '<div role="presentation" aria-label="decoration">Decorative content</div>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'aria-label on decorative element - consider using aria-hidden="true" instead');
		assert.strictEqual(issues[0].severity, 'MEDIUM');
	});

	test('Should detect very long aria-label', () => {
		const longLabel = 'a'.repeat(101);
		const line = `<button aria-label="${longLabel}">Click me</button>`;
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].issue, 'aria-label is very long - consider shortening for better user experience');
		assert.strictEqual(issues[0].severity, 'LOW');
	});

	test('Should not flag valid aria-label', () => {
		const line = '<button aria-label="Submit the form">Submit</button>';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 0);
	});

	test('Should not flag aria-label on input with proper labeling', () => {
		const line = '<input type="text" aria-label="Enter your email address">';
		const issues = AriaLabelRoleChecker.checkAriaLabelAndRole(line, 0, '');
		
		assert.strictEqual(issues.length, 0);
	});
});
