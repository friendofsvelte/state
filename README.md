# Persistent Svelte 5 State

A lightweight, type-safe state management solution for Svelte applications with built-in storage persistence.

## Features

- 🎯 **Type-safe**: Full TypeScript support with automatic type inference
- 💾 **Persistent Storage**: Automatic state persistence in localStorage or sessionStorage
- 🪶 **Lightweight**: Zero dependencies beyond Svelte
- ⚡ **Reactive**: Seamless integration with Svelte's reactivity system
- 🔄 **Auto-sync**: Automatically syncs state across components
- 📦 **Simple API**: Just one function to manage all your state needs

## Installation

```bash
npm install @friendofsvelte/state
```

## Quick Start

1. Define your types in your app.d.ts:

```typescript
declare global {
  interface PodTypeRegistry {
    layout: {
      bg: string;
    };
    userSettings: {
      theme: 'light' | 'dark';
      fontSize: number;
    };
  }
}

export {};
```

2. Use in your components:

```svelte
<script lang="ts">
  import { pod } from '@friendofsvelte/state';
  
  // Initialize with value
  let app = pod('layout', 'localStorage', {
    bg: 'lightblue'
  });
  
  // Or use existing value
  let settings = pod('userSettings', 'sessionStorage');
</script>

<div style="background-color: {app.bg}">
  <!-- Your content -->
</div>
```

## API Reference

### `pod<K>(key: K, storage: StorageType, context?: GetTypeFromRegistry<K>, override?: boolean)`

Creates or retrieves a persistent state container.

Parameters:
- `key`: Unique identifier for the state container
- `storage`: Storage type - 'localStorage' or 'sessionStorage'
- `context`: (Optional) Initial state value
- If `override` is `true`, it writes the `context` to storage regardless of the current stored value.
- If `override` is `false` and there is no stored value, it writes the `context` to storage.
- If `override` is `false` and there is a stored value, it uses the stored value instead of the `context`.

The `pod` function passes the `override` parameter to the `track` function.

Returns:
- A reactive state object of type `GetTypeFromRegistry<K>`

## Type Safety

Pod State provides complete type safety through TypeScript. The global `PodTypeRegistry` interface allows you to define types for all your state containers in one place:

```typescript
interface PodTypeRegistry {
  layout: {
    bg: string;
  };
  userSettings: {
    theme: 'light' | 'dark';
    fontSize: number;
  };
}
```

## Examples

### Basic Usage

```svelte
<script lang="ts">
  import { pod } from '@friendofsvelte/state';
  
  let app = pod('layout', 'localStorage', {
    bg: 'lightblue'
  });
</script>

<button onclick={() => app.bg = 'lightgreen'}>
  Change Background
</button>
```

### Shared State

```svelte
<!-- ComponentA.svelte -->
<script>
  import { pod } from '@friendofsvelte/state';
  let settings = pod('userSettings', 'sessionStorage');
</script>

<!-- ComponentB.svelte -->
<script>
  import { pod } from '@friendofsvelte/state';
  let settings = pod('userSettings', 'sessionStorage');
  // Will automatically sync with ComponentA
</script>
```


## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/friendofsvelte/state/pulls).

## License

MIT License - see LICENSE file for details
