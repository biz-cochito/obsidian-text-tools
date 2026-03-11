import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import TextUtilitiesPlugin from "./main";

export interface TextUtilitiesSettings {
	uppercaseOnPaste: boolean;
}

export const DEFAULT_SETTINGS: TextUtilitiesSettings = {
	uppercaseOnPaste: false
}

export class TextUtilitiesSettingTab extends PluginSettingTab {
	plugin: TextUtilitiesPlugin;

	constructor(app: App, plugin: TextUtilitiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Text Utilities Settings'});

		new Setting(containerEl)
			.setName('Uppercase on Paste')
			.setDesc('Example setting: Automatically uppercase text when pasted (not implemented).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.uppercaseOnPaste)
				.onChange(async (value) => {
					this.plugin.settings.uppercaseOnPaste = value;
					await this.plugin.saveSettings();
				}));
	}
}
