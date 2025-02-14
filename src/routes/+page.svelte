<script>
	import { glorified } from '$lib/state.svelte.js';

	let app = glorified('layout');
	$inspect(app);
</script>

{#if app}
	{app.bg}
	<button title="make green" onclick={() => app.bg = 'lightgreen'}>green</button>
{/if}