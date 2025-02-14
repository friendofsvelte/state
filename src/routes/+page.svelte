<script>
	import { pod } from '$lib/state.svelte.js';

	let app = pod('layout');
	$inspect(app);
</script>

{#if app}
	{app.bg}
	<button title="make green" onclick={() => app.bg = 'lightgreen'}>green</button>
{/if}