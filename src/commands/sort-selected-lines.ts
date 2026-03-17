import { Plugin, Editor, MarkdownView, Notice } from "obsidian";

export function registerSortSelectedLines(plugin: Plugin) {
    plugin.addCommand({
        id: "sort-selected-lines",
        name: "Sort selected lines alphabetically",
        editorCallback: (editor: Editor, view: MarkdownView) => {
            const selection = editor.getSelection();
            if (!selection) {
                new Notice("No text selected to sort");
                return;
            }

            const lines = selection.split("\n");
            
            // Perform a case-insensitive, alphanumeric-aware sort
            lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            editor.replaceSelection(lines.join("\n"));
        },
    });
}
