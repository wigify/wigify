# Wigify Features

## Widget System

Wigify allows users to create and display custom desktop widgets built with plain HTML, CSS, and JavaScript. Widgets are standalone mini-applications that float on your desktop, providing quick access to information and tools.

### Widget Sources

User-created widgets are stored in `~/.wigify/widgets/`. Users can create new widgets from templates using the app's widget creation feature.

### Widget Structure

Each widget follows this structure:

```
widget-name/
├── package.json      # Widget manifest (name, size, variables)
└── widget.html       # Widget source (HTML, CSS, JS)
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

### Widget Source (widget.html)

Widgets are plain HTML files with embedded CSS and JavaScript:

```html
<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, sans-serif;
    color: white;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 12px;
  }
</style>

<div class="container">
  <span id="value">Loading...</span>
</div>

<script>
  const apiKey = wigify.variables.apiKey;

  setInterval(() => {
    // Refresh data
  }, 60000);
</script>
```

### Widget API (`window.wigify`)

The widget API is available as a global object in widget scripts:

| Property / Method   | Description                                      |
| ------------------- | ------------------------------------------------ |
| `wigify.variables`  | Object containing all configured variable values |
| `wigify.instanceId` | The unique instance ID of this widget            |
| `wigify.widgetName` | The widget name                                  |
| `wigify.refresh()`  | Reload the widget                                |

### Variable Types

| Type      | Description                                         |
| --------- | --------------------------------------------------- |
| `text`    | Plain text input                                    |
| `secret`  | Encrypted text (stored securely in system keychain) |
| `number`  | Numeric value                                       |
| `boolean` | True/false toggle                                   |

### Widget Templates

Wigify provides templates as starting points for creating new widgets:

#### Blank Template

- Minimal HTML widget with basic styling
- Perfect for starting from scratch

#### Stat Template

- Pre-styled widget for displaying a single statistic
- Great for Grafana metrics, system stats, or any numeric display

### Cursor Dodge

Widgets automatically hide and become click-through when the cursor approaches any widget, allowing you to interact with content behind them without manually moving widgets out of the way. When the cursor moves away, all widgets reappear.

- **Instant hide**: All widgets instantly disappear when the cursor gets within 150px of any widget
- **Click-through**: Hidden widgets pass mouse events through so you can click on whatever is behind them
- **Tray toggle**: Use the system tray menu to enable or disable auto-hide. When disabled, widgets stay visible and can be moved freely

### System Tray

Wigify lives in the system tray (menu bar on macOS) for quick access:

- **Auto-hide Widgets**: Toggle cursor dodge on/off (enabled by default)
- **Show Window**: Bring the main Wigify window to the front
- **Quit**: Exit the application

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
