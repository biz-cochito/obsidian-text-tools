import { Plugin } from "obsidian";
import { registerRemoveRedundantH1 } from "./remove-redundant-h1";
import { registerSortSelectedLines } from "./sort-selected-lines";

export function registerCommands(plugin: Plugin) {
    registerRemoveRedundantH1(plugin);
    registerSortSelectedLines(plugin);
}
