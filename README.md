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

1. Define your state using `PersistentState`:

```typescript
// new.svelte.ts / js
import { PersistentState } from '@friendofsvelte/state';

export const box = new PersistentState('box', {
  color: '#ff3e00',
  dimensions: [100, 100]
}, 'sessionStorage');
```

2. Use in your components:

```svelte
<script lang="ts">
  import { box } from '$lib/new.svelte';

  const listColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown'];

  function switchNextColor() {
    const currentIndex = listColors.indexOf(box.current.color);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= listColors.length) {
      box.current.color = listColors[0];
    } else {
      box.current.color = listColors[nextIndex];
    }
  }
</script>

<div
  style="background-color: {box.current.color}; width: 100px; height: 100px; color: gray; text-align: center;"
  class="m-2 rounded-2xl"
>
  {box.current.color}
</div>

<button onclick={switchNextColor} class="bg-gray-700 m-2 px-3 rounded-2xl text-gray-200">
  Change color
</button>
```

## API Reference

### `PersistentState<T>(key: string, initial?: T, storageType: StorageType = 'localStorage')`

Creates or retrieves a persistent state container.

Parameters:
- `key`: Unique identifier for the state container
- `initial`: (Optional) Initial state value
- `storageType`: (Optional) Storage type - 'localStorage' or 'sessionStorage' (default: 'localStorage')

Returns:
- A reactive state object of type `T`

> Inspired by: Rich-Harris' [local-storage-test](https://github.com/Rich-Harris/local-storage-test/blob/main/src/lib/storage.svelte.ts)


## Examples

### Basic Usage

```svelte
<script lang="ts">
  import { PersistentState } from '@friendofsvelte/state';

  const box = new PersistentState('box', {
    color: '#ff3e00',
    dimensions: [100, 100]
  }, 'sessionStorage');

  function switchNextColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown'];
    const currentIndex = colors.indexOf(box.current.color);
    box.current.color = colors[(currentIndex + 1) % colors.length];
  }
</script>

<div style="background-color: {box.current.color}; width: 100px; height: 100px; color: gray; text-align: center;" class="m-2 rounded-2xl">
  {box.current.color}
</div>

<button onclick={switchNextColor} class="bg-gray-700 m-2 px-3 rounded-2xl text-gray-200">
  Change color
</button>
```

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/friendofsvelte/state/pulls).

## License

MIT License - see LICENSE file for details
