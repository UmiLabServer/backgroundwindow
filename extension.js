import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import St from "gi://St";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class BackgroundWindowExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._sourceId = 0;
        this._backgroundWindows = new Set();
        this._lastFocusedWindow = null;
    }

    enable() {
        try {
            Main.wm.addKeybinding(
                'toggle-background-window',
                this.getSettings(),
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                () => {
                    const focusedWindow = global.display.get_focus_window();
                    if (focusedWindow) {
                        const wmClass = focusedWindow.get_wm_class();

                        if (this._backgroundWindows.has(focusedWindow)) {
                            this._backgroundWindows.delete(focusedWindow);
                            focusedWindow.unmake_above();
                            focusedWindow.raise();
                        } else {
                            this._backgroundWindows.add(focusedWindow);
                            focusedWindow.stick();
                            focusedWindow.lower();
                            
                            const windows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
                            for (const win of windows) {
                                if (!this._backgroundWindows.has(win)) {
                                    win.activate(global.get_current_time());
                                    this._lastFocusedWindow = win;
                                    break;
                                }
                            }
                            
                            const windowActor = focusedWindow.get_compositor_private();
                            if (windowActor) {
                                const parent = windowActor.get_parent();
                                const backgroundGroup = Main.layoutManager._backgroundGroup;
                                if (parent && backgroundGroup) {
                                    parent.set_child_above_sibling(windowActor, backgroundGroup);
                                }
                            }
                        }
                    }
                }
            );

            this._sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                const currentFocus = global.display.get_focus_window();
                
                if (Main.overview.visible) {
                    return GLib.SOURCE_CONTINUE;
                }
                
                if (currentFocus && !this._backgroundWindows.has(currentFocus)) {
                    this._lastFocusedWindow = currentFocus;
                }
                
                for (const window of this._backgroundWindows) {
                    try {
                        if (global.display.get_focus_window() === window) {
                            if (this._lastFocusedWindow && this._lastFocusedWindow !== window) {
                                const lastWorkspace = this._lastFocusedWindow.get_workspace();
                                const currentWorkspace = global.workspace_manager.get_active_workspace();
                                if (lastWorkspace === currentWorkspace) {
                                    this._lastFocusedWindow.activate(global.get_current_time());
                                } else {
                                    const windows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
                                    for (const win of windows) {
                                        if (!this._backgroundWindows.has(win) && win.get_workspace() === currentWorkspace) {
                                            win.activate(global.get_current_time());
                                            break;
                                        }
                                    }
                                }
                            } else {
                                const currentWorkspace = global.workspace_manager.get_active_workspace();
                                const windows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
                                for (const win of windows) {
                                    if (!this._backgroundWindows.has(win) && win.get_workspace() === currentWorkspace) {
                                        win.activate(global.get_current_time());
                                        break;
                                    }
                                }
                            }
                        }
                        
                        window.lower();
                        const windowActor = window.get_compositor_private();
                        if (windowActor) {
                            const parent = windowActor.get_parent();
                            const backgroundGroup = Main.layoutManager._backgroundGroup;
                            if (parent && backgroundGroup) {
                                parent.set_child_above_sibling(windowActor, backgroundGroup);
                            }
                        }
                    } catch (e) {
                    }
                }
                return GLib.SOURCE_CONTINUE;
            });

        } catch (error) {
            throw error;
        }
    }

    disable() {
        try {
            Main.wm.removeKeybinding('toggle-background-window');
            for (const window of this._backgroundWindows) {
                try {
                    window.unstick();
                    window.raise();
                } catch (e) {
                }
            }
            this._backgroundWindows.clear();
            this._lastFocusedWindow = null;

            if (this._sourceId) {
                GLib.source_remove(this._sourceId);
                this._sourceId = 0;
            }

        } catch (error) {
        }
    }
}
