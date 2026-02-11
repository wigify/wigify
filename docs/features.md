# Wigify Features

## Widget System

Wigify allows users to create and display custom desktop widgets built with React. Widgets are standalone mini-applications that float on your desktop, providing quick access to information and tools.

### Widget Sources

User-created widgets are stored in `~/.wigify/widgets/`. Users can create new widgets from templates using the app's widget creation feature.

### Widget Structure

Each widget follows this structure:

```
widget-name/
├── package.json      # Widget manifest (name, size, variables)
├── src/
│   └── widget.tsx    # Widget React component (source)
└── dist/
    └── widget.js     # Pre-built widget bundle
```

User configuration is stored separately in `~/.config/wigify/`:

```
~/.config/wigify/
├── config.json           # Widget instances configuration
└── variables/
    └── widget-name.json  # User-configured variable values per widget
```

### Widget Manifest (package.json)

```json
{
  "name": "my-widget",
  "version": "1.0.0",
  "title": "My Widget",
  "description": "A description of what this widget does",
  "author": "Your Name",
  "size": {
    "width": 200,
    "height": 100
  },
  "minSize": {
    "width": 150,
    "height": 80
  },
  "resizable": false,
  "variables": [
    {
      "name": "apiKey",
      "type": "secret",
      "title": "API Key",
      "description": "Your API key for the service",
      "required": true
    },
    {
      "name": "refreshInterval",
      "type": "number",
      "title": "Refresh Interval",
      "default": 60
    }
  ]
}
```

### Widget Component

Widgets are React components that can use the `@wigify/api` package:

```tsx
import { useVariable, useInterval } from '@wigify/api';

export default function MyWidget() {
  const apiKey = useVariable<string>('apiKey');
  
  useInterval(() => {
    // Refresh data
  }, 60000);

  return (
    <div style={{ /* widget styles */ }}>
      {/* Widget content */}
    </div>
  );
}
```

### Widget API (`@wigify/api`)

The widget API provides hooks for widget authors:

| Hook | Description |
|------|-------------|
| `useVariable<T>(name)` | Get a configured variable value |
| `useVariables()` | Get all variable values |
| `useRefresh()` | Get a function to refresh the widget |
| `useInterval(callback, ms)` | Run a callback at an interval |
| `useAutoRefresh(ms)` | Auto-refresh the widget at an interval |
| `useWidgetInfo()` | Get widget instance ID and name |

### Variable Types

| Type | Description |
|------|-------------|
| `text` | Plain text input |
| `secret` | Encrypted text (stored securely in system keychain) |
| `number` | Numeric value |
| `boolean` | True/false toggle |

### Widget Templates

Wigify provides templates as starting points for creating new widgets:

#### Blank Template
- Minimal React widget with basic styling
- Perfect for starting from scratch

#### Stat Template  
- Pre-styled widget for displaying a single statistic
- Includes a placeholder `getData()` function
- Great for Grafana metrics, system stats, or any numeric display

### Main Window

The main window serves as the widget manager where you can:

- Create new widgets from templates
- View all user widgets
- Add widgets to the screen
- Remove widgets from the screen
- Configure widget variables
- Edit widget code
- Use the in-app widget builder workspace with collapsible variable sidebar, variable search, and preview data dock
- Open widget folders in your file manager
