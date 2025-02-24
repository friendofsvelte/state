import { getContext, setContext, untrack } from 'svelte';
const EMPTY = Symbol('___empty____');

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


function makeContextKey<K extends keyof PodTypeRegistry>(key: K, storage: StorageType) {
    return `${key}__${storage}__pod`;
}

function track<K extends keyof PodTypeRegistry, V = GetTypeFromRegistry<K>>(
    key: K,
    storage: StorageType,
    context?: V,
    override: boolean = false
) {
    const contextKey = makeContextKey(key, storage);
    if (context === EMPTY) {
        return getContext(contextKey) as V;
    }
    let state = $state<V>(context as V);

    if (typeof window !== 'undefined') {
        const storedValue = untrack(() => window[storage].getItem(String(key)));
        if (storedValue && !override) {
            try {
                state = JSON.parse(storedValue) as V;
            } catch {
                state = {} as V;
            }
        } else if (override || !storedValue) {
            state = context ?? ({} as V);
            const json = JSON.stringify($state.snapshot(state));
            window[storage].setItem(String(key), json);
        }
        if (context !== EMPTY) {
            $effect.pre(() => {
                const json = JSON.stringify($state.snapshot(state));
                window[storage].setItem(String(key), json);
            });
        }
    }

    return setContext(contextKey, state);
}

/**
 * Get a persistent state from storage, or initialize with an optional context.
 * @param key - The key to store the state.
 * @param storage - The storage type to use.
 * @param context - The initial state or override.
 * @param override - Whether to override the stored value with the provided context.
 */
export function pod<K extends keyof PodTypeRegistry>(
    key: K,
    storage: StorageType,
    // @ts-ignore
    context?: GetTypeFromRegistry<K> = EMPTY,
    override: boolean = false
): GetTypeFromRegistry<K> {
    return track(key, storage, context, override);
}