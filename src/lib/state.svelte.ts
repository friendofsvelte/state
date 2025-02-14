import { untrack } from 'svelte';

type StorageType = 'localStorage' | 'sessionStorage';

type TypeRegistry = {
	[K in PropertyKey]: unknown;
};

declare global {
	// @ts-ignore
	type PodTypeRegistry = TypeRegistry;
}

type GetTypeFromRegistry<K extends keyof PodTypeRegistry> = PodTypeRegistry[K] extends never
	? unknown
	: PodTypeRegistry[K];

function track<K extends keyof PodTypeRegistry, V = GetTypeFromRegistry<K>>(
	key: K,
	storage: StorageType,
	context?: V
) {
	let state = $state<V>(context ?? ({} as V));

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
export function pod<K extends keyof PodTypeRegistry>(
	key: K,
	storage: StorageType = 'localStorage',
	context?: GetTypeFromRegistry<K>
): GetTypeFromRegistry<K> {
	return track(key, storage, context);
}
