import { Plugin } from "obsidian";
import { registerConvertCaseCommands } from "./convert-case";
import { registerRemoveRedundantH1 } from "./remove-redundant-h1";
import { registerSortSelectedLines } from "./sort-selected-lines";

export function registerCommands(plugin: Plugin) {
    registerConvertCaseCommands(plugin);
    registerRemoveRedundantH1(plugin);
    registerSortSelectedLines(plugin);
}
