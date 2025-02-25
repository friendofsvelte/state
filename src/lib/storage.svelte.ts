// See our inspiration: https://github.com/Rich-Harris/local-storage-test/blob/main/src/lib/storage.svelte.ts

import { tick } from 'svelte';

export type StorageType = 'localStorage' | 'sessionStorage';

export class PersistentState<T> {
  #key: string;
  #version = $state(0);
  #listeners = 0;
  #value: T | undefined;
  #storage: Storage;

  #handler = (e: StorageEvent) => {
    if (e.storageArea !== this.#storage) return;
    if (e.key !== this.#key) return;

    this.#version += 1;
  };

  constructor(key: string, initial?: T, storageType: StorageType = 'localStorage') {
    this.#key = key;
    this.#value = initial;
    this.#storage = storageType === 'localStorage' ? localStorage : sessionStorage;

    if (typeof this.#storage !== 'undefined') {
      if (this.#storage.getItem(key) === null) {
        this.#storage.setItem(key, JSON.stringify(initial));
      }
    }
  }

  get current(): T {
    this.#version;

    const root =
      typeof this.#storage !== 'undefined'
        ? JSON.parse(this.#storage.getItem(this.#key) as any)
        : this.#value;

    const proxies = new WeakMap();

    const proxy = (value: unknown) => {
      if (typeof value !== 'object' || value === null) {
        return value;
      }

      let p = proxies.get(value);
      if (!p) {
        p = new Proxy(value, {
          get: (target, property) => {
            this.#version;
            return proxy(Reflect.get(target, property));
          },
          set: (target, property, value) => {
            this.#version += 1;
            Reflect.set(target, property, value);

            if (typeof this.#storage !== 'undefined') {
              this.#storage.setItem(this.#key, JSON.stringify(root));
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
    return proxy(root);
  }

  set current(value: T) {
    if (typeof this.#storage !== 'undefined') {
      this.#storage.setItem(this.#key, JSON.stringify(value));
    }

    this.#version += 1;
  }
}