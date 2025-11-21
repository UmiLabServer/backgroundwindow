# Background Window Extension

A GNOME Shell extension that allows you to pin windows to the background, similar to VLC's `--video-wallpaper` mode.

## Features

- Pin any window to the background with a keyboard shortcut
- Background windows stay behind all other windows
- Background windows are visible across all workspaces
- Automatic focus management - clicking a background window automatically switches focus to another window
- No visible UI elements

## Installation


## Usage

### Default Keybinding

- **Toggle background mode**: `Ctrl+Alt+B`

Press the keybinding while a window is focused to pin it to the background. Press again on the same window to restore it to normal mode.

### Customizing Keybinding

You can customize the keybinding using GNOME Settings:

```bash
gnome-extensions prefs backgroundwindow@stron.umilab.net
```

Or manually edit the schema with `dconf-editor`:
```
org.gnome.shell.extensions.backgroundwindow
```

## How It Works

When you pin a window to the background:

1. The window is made visible on all workspaces (`stick()`)
2. The window is moved to the bottom of the window stack (`lower()`)
3. The window is positioned just above the desktop background in the Clutter rendering hierarchy
4. Focus is automatically transferred to another window
5. If you click the background window, focus is immediately redirected to the last focused window

The extension monitors focus changes every 100ms to ensure background windows never receive focus.

## Compatibility

- GNOME Shell 49
- Tested on Fedora with Wayland

## Development

### Testing with devkit

```bash
dbus-run-session -- gnome-shell --devkit
```

### Building with GNOME Builder

Open the project in GNOME Builder and press `Ctrl+Shift+B` to build.

## Technical Details

### Architecture

- `Extension` base class for GNOME Shell 45+
- Uses `Meta.Window` API for window management
- Uses Clutter actors for rendering hierarchy manipulation
- GSettings integration for keybinding configuration

### Key Components

- **Focus tracking**: Monitors `global.display.get_focus_window()` to detect focus changes
- **Workspace awareness**: Only activates windows on the current workspace
- **Rendering position**: Places windows between desktop background and normal windows using `set_child_above_sibling()`

## License

MIT License

## Author

UmiLabServer
