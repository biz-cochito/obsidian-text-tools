import { Plugin } from "obsidian";
import { registerRemoveRedundantH1 } from "./remove-redundant-h1";

export function registerCommands(plugin: Plugin) {
    registerRemoveRedundantH1(plugin);
}
