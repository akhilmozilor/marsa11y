import * as assert from 'assert';
import { TabIndexChecker } from '../tabIndexChecker';

suite('TabIndexChecker Tests', () => {
	test('Should detect negative tabindex values', () => {
		const line = '<button tabindex="-1">Click me</button>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('Negative tabindex'));
	});

	test('Should detect missing tabindex on custom interactive elements', () => {
		const line = '<div role="button" onclick="handleClick()">Custom Button</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('Custom interactive element missing tabindex'));
	});

	test('Should detect tabindex on non-interactive elements', () => {
		const line = '<div tabindex="0">Non-interactive div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('Non-interactive element with tabindex="0"'));
	});

	test('Should detect positive tabindex values', () => {
		const line = '<button tabindex="5">Button</button>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Positive tabindex'));
	});

	test('Should detect missing tabindex on clickable elements', () => {
		const line = '<div onclick="handleClick()">Clickable div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Clickable element missing tabindex'));
	});

	test('Should detect tabindex on disabled elements', () => {
		const line = '<button disabled tabindex="0">Disabled button</button>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Disabled element should not be focusable'));
	});

	test('Should detect tabindex on hidden elements', () => {
		const line = '<div hidden tabindex="0">Hidden div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Hidden element should not be focusable'));
	});

	test('Should detect tabindex on elements with aria-hidden', () => {
		const line = '<div aria-hidden="true" tabindex="0">Hidden div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('aria-hidden="true" should not be focusable'));
	});

	test('Should detect tabindex on elements with role="presentation"', () => {
		const line = '<div role="presentation" tabindex="0">Presentation div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('role="presentation" should not be focusable'));
	});

	test('Should detect tabindex on elements with role="none"', () => {
		const line = '<div role="none" tabindex="0">None role div</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'HIGH');
		assert.ok(issues[0].issue.includes('role="none" should not be focusable'));
	});

	test('Should detect missing tabindex on custom form controls', () => {
		const line = '<div role="combobox">Custom combobox</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Custom form control missing tabindex'));
	});

	test('Should detect tabindex on decorative elements', () => {
		const line = '<img src="decorative.png" alt="" tabindex="0">';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'LOW');
		assert.ok(issues[0].issue.includes('Decorative element should not be focusable'));
	});

	test('Should detect redundant tabindex on naturally focusable elements', () => {
		const line = '<button tabindex="0">Natural button</button>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 1);
		assert.strictEqual(issues[0].severity, 'MEDIUM');
		assert.ok(issues[0].issue.includes('Redundant tabindex on naturally focusable element'));
	});

	test('Should not flag valid tabindex usage', () => {
		const line = '<div role="button" tabindex="0">Valid custom button</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 0);
	});

	test('Should not flag naturally focusable elements without tabindex', () => {
		const line = '<button>Natural button</button>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		assert.strictEqual(issues.length, 0);
	});

	test('Should detect multiple issues in one line', () => {
		const line = '<div role="button" onclick="handleClick()" tabindex="5">Multiple issues</div>';
		const issues = TabIndexChecker.checkTabIndex(line, 0);
		
		// Should detect missing tabindex on custom interactive (HIGH) and positive tabindex (MEDIUM)
		assert.ok(issues.length >= 2);
		
		const highSeverityIssues = issues.filter(issue => issue.severity === 'HIGH');
		const mediumSeverityIssues = issues.filter(issue => issue.severity === 'MEDIUM');
		
		assert.ok(highSeverityIssues.length >= 1);
		assert.ok(mediumSeverityIssues.length >= 1);
	});
});
