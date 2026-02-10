# Wigify - A widget tool for desktop (Electron + React + Bun)

## Supported Platforms

- MacOS
- Windows
- Linux

## Tests

Write tests for new features and bug fixes according to the following configuration:

- **Main**: Vitest - Use `bun run test`
- **Renderer**: Not implemented yet
- **Coverage**: `bun run coverage` - reports in `coverage/` folder

Tests use Vitest with vi.mock() for mocking modules (electron, AWS SDK, config), class-based mocks for constructors, dynamic imports (await import()) after vi.resetModules() to get fresh module instances with updated mocks, and are organized in src/main/**tests**/unit/ or src/main/**tests**/integration/ - run with bun run test

## Code Style

- **Formatting**: Prettier (semicolons, single quotes, 80 width, 2 spaces, arrowParens: avoid) + Tailwind pluginAa - Use `bun format`
- **Linting**: ESLint - Use `bun lint` to make sure no lint errors
- **Imports**: Group by external → components → hooks → types → utils. Use `type` for type-only imports (`import type { ToolType }`)
- **Types**: Store shared types in `src/types/` (accessible to main + renderer). Use discriminated unions for polymorphic data
- **Naming**: kebab-case (components), camelCase (functions/vars), SCREAMING_SNAKE_CASE (constants like `MACOS_COLORS`)
- **Components**: Export as default, define interfaces inline. Prefer small, reusable components over monolithic files
- **React**: Use functional components, hooks (`useCallback` for event handlers), avoid unnecessary re-renders
- **Icons**: Use Lucide React (`lucide-react`)
- **Styling**: Tailwind classes only - prefer built-in values (e.g., `gap-1`) over arbitrary values (e.g., `px-[20px]`)
- **Error Handling**: Check for null/undefined (e.g., `screenshotWindow?.method()`) and handle errors gracefully

## Architecture

- **Electron**: Main process (`src/main/`), renderer (`src/renderer/`), preload (`src/preload/`)
- **IPC**: Use `ipcMain.on` (main) / `ipcRenderer.send` (renderer) for process communication
- **State**: Local hooks (`useState`, custom hooks in `src/renderer/hooks/`) - no global state library
- **Windows**: Use the `Window` class from `src/main/lib/window.ts` for all window creation. It provides consistent styling, macOS vibrancy, and platform-specific defaults. Use `createWindow()` helper or instantiate `new Window(config)` directly.

## Performance & Design

- Minimize bundle size, memory, and CPU usage. Use lazy loading where appropriate
- Follow Shadcn design guidelines
- Use Shadcn components unless a custom component is necessary
- For frameless Electron windows with solid backgrounds, use transparent: false with a matching backgroundColor instead of transparent: true to avoid dark border artifacts on macOS.

## General Guidelines

- Don't implement hacky solutions to just make it work. We need proper solutions.
- Never build or run dev. user will do.
- Write less code and maintainable code
- Always put modularity and reusability in priority
- Prefer tailwind's built-in classes over custom sizes like px[20px]
- Try to create re-usable components instead of writing big chunks of code
- Be mindful about app size and performance and memory and cpu usage.
- Use types and interfaces and store them in the src/types folder so they can be used in both main and renderer processes.
- Learn from project's structure and implement new features in the same way.
- Break code into smaller components and files.
- When implementing a feature that can also be configurable, ask user's opinion to make it configurable in the app settings or not.
- Consider SOLID principles and best practices while writing code.
- If there is a refactor needed, ask user's opinion first.
- Avoid creating big files and components. Instead, modularize and break them into smaller pieces.
- NEVER NEVER NEVER code comment!
- Native functionality is provided by a unified Swift daemon (`wigify-daemon`). Build when finishing the task with `./scripts/build-daemon.sh` for universal architecture (arm64 + x86_64).
- When adding new native modules, add them to `src/main/daemon/Modules/` and register in `main.swift`.
- When adding assets to the project like images, icons, sounds, etc, make sure you also consider them for production build and packing and notarizing to work on packaged app too.
- Don't patch symptoms! Fix the root cause of the issues.
- Use early returns to reduce nesting
- Important to avoid nested if-else statements
- Prefer switch-case for multiple conditions
- Use agnostic implementations everywhere possible so we can re-use those codes
- Don't use just delays instead of promises! Handle them properly. (using delay is basically hacking and we should avoid)
- Code duplications should be avoided at any cost.
- Don't install third-party packages without approval.
- We might have unused codes that seemed to be in-use! if you face any of them, make sure if they are used or not then decide to keep or remove them.
- In the end of every task run `bun pre-commit` to make sure all the checks passes.
- For menu icons, Use the png icon and user will download them.

## Documentation

- If a new feature added, make sure mentioning it in /docs/features.md like how other features mentioned.

## Coding examples

### Nesting

Bad code example:

```typescript
if (
  selection.x !== undefined &&
  selection.y !== undefined &&
  selection.width !== undefined &&
  selection.height !== undefined
) {
  if (selection.status === 'selected') {
    showAllInOneControl({
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    });
  } else if (selection.status === 'updated') {
    updateAllInOnePosition({
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    });
  }
}
```

Good code example:

```typescript
if (
  selection.x === undefined ||
  selection.y === undefined ||
  selection.width === undefined ||
  selection.height === undefined
) {
  return;
}

const bounds = {
  x: selection.x,
  y: selection.y,
  width: selection.width,
  height: selection.height,
};

if (selection.status === 'selected') {
  showAllInOneControl(bounds);
  return;
}

if (selection.status === 'updated') {
  updateAllInOnePosition(bounds);
}
```

### IPC Naming

Bad example: `'foo-bar'`, `'foo-bar-to'`, `foo:fooBar`

Good example: `'foo:bar'`, `'foo:bar-to'`, `fooo:bar:to`

### Tailwind classes

Bad example: `p-[20p]x]`, `text-[14px]`, `bg-red-500`

Good example: `p-5`, `text-sm`, `bg-destructive`

### Wrapper functions

Avoid creating wrapper functions that only repeats the job

Bad example:

```typescript
function getAreaSelectorBinaryPath(): string {
  return getNativeBinaryPath('area-selector');
}
```

Good example:

Just use `getNativeBinaryPath` without wrapper.

## Skills

Use the following skills for development:

- React: @vercel-react-best-practices
- Web Design: @web-design-guidelines
- Frontend Design: @frontend-design

## Agents

Project subagents:

- @design: graphical design, UI/UX, styling, higher creativity
- @code-reviewer: code review for correctness and standards

## Questions

- If you have questions, Use the question tool only for asking questions.
