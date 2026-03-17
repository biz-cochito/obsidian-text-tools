import { Plugin } from "obsidian";
import { TextUtilitiesSettings, DEFAULT_SETTINGS, TextUtilitiesSettingTab } from "./settings";
import { registerCommands } from "./commands/index";

export default class TextUtilitiesPlugin extends Plugin {
    settings: TextUtilitiesSettings;

    async onload() {
        await this.loadSettings();

        // Add settings tab
        this.addSettingTab(new TextUtilitiesSettingTab(this.app, this));

        // Register commands
        registerCommands(this);
    }

    onunload() {
        // Any necessary cleanup
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<TextUtilitiesSettings>);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
