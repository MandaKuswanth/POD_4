## Normal Loading vs Lazy Loading in Angular

### Normal Loading / Eager Loading

In **normal loading**, Angular loads all components, modules, and related files when the application starts.

Example:

```ts
import { Dashboard } from './features/dashboard/dashboard';

{
	path: 'dashboard',
	component: Dashboard
}
```

Here, the `Dashboard` component is imported directly, so Angular includes it in the main application bundle.

### Lazy Loading

In **lazy loading**, Angular loads a component or module only when the user visits that route.

Example:

```ts
{
	path: 'dashboard',
	loadComponent: () =>
		import('./features/dashboard/dashboard').then(m => m.Dashboard)
}
```

Here, the `Dashboard` component is not loaded at application start; it loads only when the user navigates to `/dashboard`.

### When to use which

- Use eager loading for critical components required at startup.
- Use lazy loading to improve initial load time by splitting features into on-demand chunks.

### Benefits of Lazy Loading

- Faster initial load time
- Reduced bundle size
- Better perceived performance for large apps

### Tradeoffs

- Increased complexity in routing setup
- Potentially more network requests at runtime


