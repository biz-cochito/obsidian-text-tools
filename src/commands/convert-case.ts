import { Editor, Notice, Plugin, TFile } from "obsidian";

type CaseMode =
	| "camel"
	| "snake"
	| "kebab"
	| "title"
	| "upper"
	| "lower"
	| "sentence";

interface CaseCommandDefinition {
	id: string;
	name: string;
	mode: CaseMode;
}

const SELECTION_CASE_COMMANDS: CaseCommandDefinition[] = [
	{
		id: "convert-selection-to-camel-case",
		name: "Convert selection to camelCase",
		mode: "camel",
	},
	{
		id: "convert-selection-to-snake-case",
		name: "Convert selection to snake_case",
		mode: "snake",
	},
	{
		id: "convert-selection-to-kebab-case",
		name: "Convert selection to kebab-case",
		mode: "kebab",
	},
	{
		id: "convert-selection-to-title-case",
		name: "Convert selection to Title Case",
		mode: "title",
	},
	{
		id: "convert-selection-to-uppercase",
		name: "Convert selection to UPPERCASE",
		mode: "upper",
	},
	{
		id: "convert-selection-to-lowercase",
		name: "Convert selection to lowercase",
		mode: "lower",
	},
	{
		id: "convert-selection-to-sentence-case",
		name: "Convert selection to Sentence case",
		mode: "sentence",
	},
];

const FILE_NAME_CASE_COMMANDS: CaseCommandDefinition[] = [
	{
		id: "convert-active-note-name-to-camel-case",
		name: "Convert active note name to camelCase",
		mode: "camel",
	},
	{
		id: "convert-active-note-name-to-snake-case",
		name: "Convert active note name to snake_case",
		mode: "snake",
	},
	{
		id: "convert-active-note-name-to-kebab-case",
		name: "Convert active note name to kebab-case",
		mode: "kebab",
	},
	{
		id: "convert-active-note-name-to-title-case",
		name: "Convert active note name to Title Case",
		mode: "title",
	},
	{
		id: "convert-active-note-name-to-uppercase",
		name: "Convert active note name to UPPERCASE",
		mode: "upper",
	},
	{
		id: "convert-active-note-name-to-lowercase",
		name: "Convert active note name to lowercase",
		mode: "lower",
	},
	{
		id: "convert-active-note-name-to-sentence-case",
		name: "Convert active note name to Sentence case",
		mode: "sentence",
	},
];

export function registerConvertCaseCommands(plugin: Plugin) {
	for (const command of SELECTION_CASE_COMMANDS) {
		plugin.addCommand({
			id: command.id,
			name: command.name,
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (!selection) {
					new Notice("No text selected to convert");
					return;
				}

				editor.replaceSelection(convertTextCase(selection, command.mode));
			},
		});
	}

	for (const command of FILE_NAME_CASE_COMMANDS) {
		plugin.addCommand({
			id: command.id,
			name: command.name,
			callback: async () => {
				const file = plugin.app.workspace.getActiveFile();
				if (!file) {
					new Notice("No active note to rename");
					return;
				}

				await renameFileWithCase(plugin, file, command.mode);
			},
		});
	}
}

function convertTextCase(text: string, mode: CaseMode): string {
	switch (mode) {
		case "camel":
			return toCamelCase(text);
		case "snake":
			return toWordSeparatorCase(text, "_");
		case "kebab":
			return toWordSeparatorCase(text, "-");
		case "title":
			return toTitleCase(text);
		case "upper":
			return text.toUpperCase();
		case "lower":
			return text.toLowerCase();
		case "sentence":
			return toSentenceCase(text);
	}
}

function splitWords(text: string): string[] {
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.split(/[^A-Za-z0-9]+/)
		.map((word) => word.trim())
		.filter(Boolean);
}

function toCamelCase(text: string): string {
	const words = splitWords(text).map((word) => word.toLowerCase());
	if (words.length === 0) {
		return "";
	}

	const [firstWord, ...remainingWords] = words;
	return firstWord + remainingWords.map(capitalize).join("");
}

function toWordSeparatorCase(text: string, separator: "_" | "-"): string {
	return splitWords(text)
		.map((word) => word.toLowerCase())
		.join(separator);
}

function toTitleCase(text: string): string {
	return splitWords(text)
		.map((word) => capitalize(word.toLowerCase()))
		.join(" ");
}

function toSentenceCase(text: string): string {
	const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
	if (!normalized) {
		return "";
	}

	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

async function renameFileWithCase(
	plugin: Plugin,
	file: TFile,
	mode: CaseMode,
): Promise<void> {
	const convertedBaseName = convertTextCase(file.basename, mode);
	if (!convertedBaseName) {
		new Notice("Converted note name would be empty");
		return;
	}

	if (convertedBaseName === file.basename) {
		new Notice("Active note name is already in that case");
		return;
	}

	const parentPath = file.parent?.path;
	const newPath = parentPath
		? `${parentPath}/${convertedBaseName}.${file.extension}`
		: `${convertedBaseName}.${file.extension}`;

	try {
		await plugin.app.fileManager.renameFile(file, newPath);
		new Notice(`Renamed note to ${convertedBaseName}`);
	} catch (error) {
		console.error("Failed to rename note", error);
		new Notice("Failed to rename active note");
	}
}
