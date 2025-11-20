import * as Main from "resource:///org/gnome/shell/ui/main.js";
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

            this._sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
                this._seconds += 1;
                if (this._label) {
                    const windows = global.display.get_tab_list(Meta.TabList.NORMAL, null);
                    this._label.text = `ループ: ${this._seconds} 秒`;
                    windows.forEach(window => {
                        
                    });
                }
                return GLib.SOURCE_CONTINUE;
            });
            
        } catch (error) {
            throw error;
        }
    }

    disable() {
        try {
            
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
