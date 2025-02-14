// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface GlobalTypeRegistry {
		layout: {
			bg: string;
		};
		// Add more types as needed
		userSettings: {
			theme: 'light' | 'dark';
			fontSize: number;
		};
		// etc...
	}
}

export {};
