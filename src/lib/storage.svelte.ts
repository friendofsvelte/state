// Based on: https://github.com/Rich-Harris/local-storage-test/blob/main/src/lib/storage.svelte.ts

import { tick } from 'svelte';

export type StorageType = 'localStorage' | 'sessionStorage';

export class PersistentState<T> {
	#key: string;
	#version = $state(0);
	#listeners = 0;
	#value: T | undefined;
	#storage: Storage | undefined;

	#handler = (e: StorageEvent) => {
		if (e.storageArea !== this.#storage) return;
		if (e.key !== this.#key) return;

		this.#version += 1;
	};

	constructor(key: string, initial?: T, storageType: StorageType = 'localStorage') {
		if (!key) {
			throw new Error('PersistentState: key must be a non-empty string');
		}

		this.#key = key;
		this.#value = initial;

		if (storageType === 'localStorage' && typeof localStorage !== 'undefined') {
			this.#storage = localStorage;
		} else if (storageType === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
			this.#storage = sessionStorage;
		}

		if (typeof this.#storage !== 'undefined') {
			if (this.#storage.getItem(key) === null) {
				try {
					this.#storage.setItem(key, JSON.stringify(initial));
				} catch {
					// Storage full or unavailable — continue with in-memory fallback
				}
			}
		}
	}

	get current(): T {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		this.#version;

		let root: T | undefined;
		if (typeof this.#storage !== 'undefined') {
			try {
				root = JSON.parse(this.#storage.getItem(this.#key) as string);
			} catch {
				root = this.#value;
			}
		} else {
			root = this.#value;
		}

		const proxies = new WeakMap();

		const proxy = (value: unknown) => {
			if (typeof value !== 'object' || value === null) {
				return value;
			}

			let p = proxies.get(value);
			if (!p) {
				p = new Proxy(value, {
					get: (target, property) => {
						// eslint-disable-next-line @typescript-eslint/no-unused-expressions
						this.#version;
						return proxy(Reflect.get(target, property));
					},
					set: (target, property, value) => {
						this.#version += 1;
						Reflect.set(target, property, value);

						if (typeof this.#storage !== 'undefined') {
							try {
								this.#storage.setItem(this.#key, JSON.stringify(root));
							} catch {
								// Storage full or unavailable
							}
						}

						return true;
					}
				});
				proxies.set(value, p);
			}

			return p;
		};

		if ($effect.tracking()) {
			$effect(() => {
				if (this.#listeners === 0) {
					window.addEventListener('storage', this.#handler);
				}

				this.#listeners += 1;

				return () => {
					tick().then(() => {
						this.#listeners -= 1;
						if (this.#listeners === 0) {
							window.removeEventListener('storage', this.#handler);
						}
					});
				};
			});
		}
		return proxy(root) as T;
	}

	set current(value: T) {
		if (typeof this.#storage !== 'undefined') {
			try {
				this.#storage.setItem(this.#key, JSON.stringify(value));
			} catch {
				// Storage full or unavailable
			}
		}

		this.#version += 1;
	}
}
