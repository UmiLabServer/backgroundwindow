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

            // キーバインディングを一度だけ追加
            Main.wm.addKeybinding(
                'toggle-background-window',
                this.getSettings(),
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                () => {
                    const focusedWindow = global.display.get_focus_window();
                    if (focusedWindow && this._label) {
                        this._label.text = `Selected window: ${focusedWindow.get_wm_class()}`;
                    }
                }
            );

            this._sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
                this._seconds += 1;
                if (this._label) {
                    const windows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
                    const window_list = []
                    windows.forEach(window => {
                        window_list.push(window.get_wm_class());
                    });
                    this._label.text = `ウィンドウ: ${window_list.join(", ")}`
                }
                return GLib.SOURCE_CONTINUE;
            });

        } catch (error) {
            throw error;
        }
    }

    disable() {
        try {
            // キーバインディングを削除
            Main.wm.removeKeybinding('toggle-background-window');

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
