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
        this._actor = null;
        this._label = null;
        this._sourceId = 0;
        this._seconds = 0;
        this._backgroundWindows = new Set()
    }

    enable() {
        try {
            this._seconds = 0;
            this._actor = new St.BoxLayout({
                style_class: "backgroundwindow-demo",
                vertical: true,
                reactive: false,
            });

            this._actor.set_position(24, 24);

            this._label = new St.Label({
                text: "BackgroundWindow ready",
                reactive: false,
            });

            this._actor.add_child(this._label);
            Main.layoutManager.addChrome(this._actor);

            Main.wm.addKeybinding(
                'toggle-background-window',
                this.getSettings(),
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                () => {
                    const focusedWindow = global.display.get_focus_window();
                    if (focusedWindow && this._label) {
                        const wmClass = focusedWindow.get_wm_class();

                        if (this._backgroundWindows.has(focusedWindow)) {
                            this._backgroundWindows.delete(focusedWindow);
                            focusedWindow.set_layer(Meta.StackLayer.NORMAL);

                            const windowActor = focusedWindow.get_compositor_private();
                            if (windowActor) {
                                windowActor.set_reactive(true);
                            }

                            focusedWindow.set_input_region(null);
                            focusedWindow.unmake_above();
                            focusedWindow.raise();
                            this._label.text = `Restored: ${wmClass}`;
                        } else {
                            this._backgroundWindows.add(focusedWindow);
                            focusedWindow.stick();
                            focusedWindow.set_layer(Meta.StackLayer.DESKTOP);
                            focusedWindow.lower();
                            focusedWindow.minimize();
                            focusedWindow.unminimize();

                            const windowActor = focusedWindow.get_compositor_private();
                            if (windowActor) {
                                windowActor.set_reactive(false);
                                windowActor.opacity = 255;
                                const rect = new Meta.Rectangle({ x: 0, y: 0, width: 0, height: 0 });
                                focusedWindow.set_input_region(rect);
                            }

                            this._label.text = `Background: ${wmClass}`;
                        }
                    }
                }
            );

            this._sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
                for (const window of this._backgroundWindows) {
                    try {
                        window.lower();
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
                    window.set_layer(Meta.StackLayer.NORMAL);
                    
                    const windowActor = window.get_compositor_private();
                    if (windowActor) {
                        windowActor.set_reactive(true);
                    }
                    window.set_input_region(null);

                    window.unstick();
                    window.raise();
                } catch (e) {
                }
            }
            this._backgroundWindows.clear();

            if (this._sourceId) {
                GLib.source_remove(this._sourceId);
                this._sourceId = 0;
            }

            if (this._actor) {
                Main.layoutManager.removeChrome(this._actor);
                this._actor.destroy();
                this._actor = null;
            }

            this._label = null;
            this._seconds = 0;

        } catch (error) {
        }
    }
}
