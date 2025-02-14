import { untrack } from 'svelte';

type StorageType = 'localStorage' | 'sessionStorage';

function track<K, V>(key: K, storage: StorageType, context?: V) {
	let state = $state<V>(context ?? ({} as V)); // Default to empty object

	if (typeof window !== 'undefined') {
		if (context === undefined) {
			const storedValue = untrack(() => window[storage].getItem(String(key)));
			if (storedValue) {
				try {
					state = JSON.parse(storedValue) as V;
				} catch {
					state = {} as V;
				}
			}
		}

		$effect.pre(() => {
			const json = JSON.stringify($state.snapshot(state));
			window[storage].setItem(String(key), json);
		});
	}

	return state;
}

/**
 * Get a persistent state from storage, or initialize with an optional context.
 * @param key - The key to store the state.
 * @param storage - The storage type to use.
 * @param context - The initial state or override.
 */
export function glorified<K, V>(
	key: K,
	storage: StorageType = 'localStorage',
	context?: V
): V {
	return track(key, storage, context);
}
