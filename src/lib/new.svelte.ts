import { PersistentState } from "./storage.svelte.js";

export const box = new PersistentState('box', {
  color: '#ff3e00',
  dimensions: [100, 100]
}, 'sessionStorage');