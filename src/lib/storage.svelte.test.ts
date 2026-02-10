import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersistentState } from './storage.svelte.js';

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

// ──────────────────────────────────────────────
// Constructor
// ──────────────────────────────────────────────
describe('PersistentState constructor', () => {
	it('throws on empty key', () => {
		expect(() => new PersistentState('')).toThrow(
			'PersistentState: key must be a non-empty string'
		);
	});

	it('stores initial value in localStorage by default', () => {
		new PersistentState('greeting', 'hello');
		expect(localStorage.getItem('greeting')).toBe(JSON.stringify('hello'));
	});

	it('stores initial value in sessionStorage when specified', () => {
		new PersistentState('greeting', 'hello', 'sessionStorage');
		expect(sessionStorage.getItem('greeting')).toBe(JSON.stringify('hello'));
	});

	it('does not overwrite an existing value in storage', () => {
		localStorage.setItem('count', JSON.stringify(42));
		new PersistentState('count', 0);
		expect(localStorage.getItem('count')).toBe(JSON.stringify(42));
	});
});

// ──────────────────────────────────────────────
// SSR safety (no storage globals)
// ──────────────────────────────────────────────
describe('PersistentState without storage (SSR)', () => {
	it('falls back to initial value when localStorage is unavailable', () => {
		const original = globalThis.localStorage;
		Object.defineProperty(globalThis, 'localStorage', {
			value: undefined,
			configurable: true
		});

		try {
			const state = new PersistentState('ssr-key', 'fallback');
			expect(state.current).toBe('fallback');
		} finally {
			Object.defineProperty(globalThis, 'localStorage', {
				value: original,
				configurable: true
			});
		}
	});

	it('falls back to initial value when sessionStorage is unavailable', () => {
		const original = globalThis.sessionStorage;
		Object.defineProperty(globalThis, 'sessionStorage', {
			value: undefined,
			configurable: true
		});

		try {
			const state = new PersistentState('ssr-key', 'fallback', 'sessionStorage');
			expect(state.current).toBe('fallback');
		} finally {
			Object.defineProperty(globalThis, 'sessionStorage', {
				value: original,
				configurable: true
			});
		}
	});
});

// ──────────────────────────────────────────────
// Get / Set with primitives
// ──────────────────────────────────────────────
describe('PersistentState get/set primitives', () => {
	it('returns the initial value', () => {
		const state = new PersistentState('num', 7);
		expect(state.current).toBe(7);
	});

	it('persists a new value to storage', () => {
		const state = new PersistentState('num', 0);
		state.current = 99;
		expect(localStorage.getItem('num')).toBe(JSON.stringify(99));
	});

	it('reads the updated value back', () => {
		const state = new PersistentState('num', 0);
		state.current = 99;
		expect(state.current).toBe(99);
	});

	it('handles string values', () => {
		const state = new PersistentState('str', 'alpha');
		state.current = 'beta';
		expect(state.current).toBe('beta');
	});

	it('handles boolean values', () => {
		const state = new PersistentState('bool', true);
		state.current = false;
		expect(state.current).toBe(false);
	});

	it('handles null value', () => {
		const state = new PersistentState<string | null>('nullable', 'something');
		state.current = null;
		expect(state.current).toBe(null);
	});
});

// ──────────────────────────────────────────────
// Get / Set with objects and arrays
// ──────────────────────────────────────────────
describe('PersistentState get/set objects and arrays', () => {
	it('returns an object initial value', () => {
		const state = new PersistentState('obj', { a: 1, b: 'two' });
		const val = state.current;
		expect(val.a).toBe(1);
		expect(val.b).toBe('two');
	});

	it('persists a replaced object', () => {
		const state = new PersistentState('obj', { x: 0 });
		state.current = { x: 42 };
		expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({ x: 42 });
	});

	it('returns an array initial value', () => {
		const state = new PersistentState('arr', [1, 2, 3]);
		const val = state.current;
		expect(val[0]).toBe(1);
		expect(val[2]).toBe(3);
	});

	it('persists a replaced array', () => {
		const state = new PersistentState('arr', [1]);
		state.current = [10, 20];
		expect(JSON.parse(localStorage.getItem('arr')!)).toEqual([10, 20]);
	});
});

// ──────────────────────────────────────────────
// Error handling: corrupted JSON
// ──────────────────────────────────────────────
describe('PersistentState corrupted storage data', () => {
	it('falls back to initial value when stored JSON is invalid', () => {
		localStorage.setItem('corrupt', '{not valid json!!!');
		const state = new PersistentState('corrupt', 'safe-default');
		expect(state.current).toBe('safe-default');
	});

	it('falls back to initial value when stored value is empty string', () => {
		localStorage.setItem('empty-json', '');
		const state = new PersistentState('empty-json', 'default');
		expect(state.current).toBe('default');
	});
});

// ──────────────────────────────────────────────
// Error handling: quota exceeded on setItem
// ──────────────────────────────────────────────
describe('PersistentState storage write errors', () => {
	it('does not throw when setItem fails in constructor', () => {
		const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError');
		});

		expect(() => new PersistentState('quota', 'data')).not.toThrow();
		spy.mockRestore();
	});

	it('does not throw when setItem fails on set current', () => {
		const state = new PersistentState('quota', 'initial');
		const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError');
		});

		expect(() => {
			state.current = 'new-value';
		}).not.toThrow();
		spy.mockRestore();
	});
});
