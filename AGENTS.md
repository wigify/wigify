# Wigify - Electron + React + Bun

## Code Style

- **Formatting**: Prettier (semicolons, single quotes, 80 width, 2 spaces, arrowParens: avoid) + Tailwind plugin — `bun format`
- **Linting**: ESLint — `bun lint`
- **Imports**: Group by external → components → hooks → types → utils. Use `import type` for type-only imports
- **Types**: Shared types in `src/types/`, import with `import type { X } from '@/types'`
- **Naming**: kebab-case (files), camelCase (functions/vars), SCREAMING_SNAKE_CASE (constants)
- **IPC Naming**: Colon-separated — `'foo:bar'`, `'foo:bar-to'` (not `'foo-bar'` or `foo:fooBar`)
- **Icons**: Lucide React (`lucide-react`)
- **Styling**: Tailwind built-in classes only (`p-5`, `text-sm`, `bg-destructive`) — never arbitrary values (`p-[20px]`, `text-[14px]`)
- **Components**: Default exports, inline interfaces, small and reusable
- **React**: Functional components, `useCallback` for handlers, avoid unnecessary re-renders
- **Error Handling**: Null-safe access (`window?.method()`), handle errors gracefully
- **No code comments** — ever

## Guidelines

- Never build or run dev — user will do
- No hacky solutions — fix root causes, not symptoms
- No code duplication
- No unnecessary wrapper functions — call the original directly
- No delays as substitutes for proper async handling
- No third-party packages without approval
- Early returns over nested if-else. Prefer switch-case for multiple conditions
- Keep files and components small and modular
- Ask user before: refactoring, making features configurable in settings
- Run `bun pre-commit` at the end of every task
- Use the question tool for asking questions
- Use Shadcn components and design guidelines unless custom is necessary
- Assets (images, icons, sounds) must work in both dev and production/packaged builds

## Examples

### Early returns over nesting

Bad:

```typescript
if (a && b) {
  if (status === 'x') doX({ a, b });
  else if (status === 'y') doY({ a, b });
}
```

Good:

```typescript
if (!a || !b) return;
const data = { a, b };
if (status === 'x') return doX(data);
if (status === 'y') doY(data);
```
