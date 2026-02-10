<script lang="ts">
	import { box } from '$lib/new.svelte.js';

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
	style="background-color: {box.current
		.color}; width: 100px; height: 100px; color: gray; text-align: center;"
	class="m-2 rounded-2xl"
>
	{box.current.color}
</div>

<button onclick={switchNextColor} class="m-2 rounded-2xl bg-gray-700 px-3 text-gray-200"
	>Change color</button
>
