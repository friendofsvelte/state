<script lang="ts">
	import '../app.css';
	import { pod } from '$lib/state.svelte.js';
	let { children } = $props();
	let app = pod('layout', 'localStorage', {
		bg: 'lightblue',
	});
</script>

{@render children()}
