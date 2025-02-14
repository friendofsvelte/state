<script lang="ts">
	import '../app.css';
	import { glorified } from '$lib/state.svelte.js';
	let { children } = $props();
	let app = glorified('layout', 'localStorage', {
		bg: 'lightblue',
	});
</script>

{@render children()}
