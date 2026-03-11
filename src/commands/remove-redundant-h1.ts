import { Editor, MarkdownView, Plugin, Notice, TFile } from "obsidian";

export function registerRemoveRedundantH1(plugin: Plugin) {
    // Single file command (Active Editor)
    plugin.addCommand({
        id: 'remove-redundant-h1',
        name: 'Remove redundant H1 in active file',
        editorCallback: (editor: Editor, view: MarkdownView) => {
            const file = view.file;
            if (!file) return;
            const title = file.basename;
            
            const lineCount = editor.lineCount();
            let inFrontmatter = false;
            
            for (let i = 0; i < lineCount; i++) {
                const line = editor.getLine(i);
                
                // Frontmatter handling
                if (i === 0 && line.trim() === '---') {
                    inFrontmatter = true;
                    continue;
                }
                if (inFrontmatter) {
                    if (line.trim() === '---') {
                        inFrontmatter = false;
                    }
                    continue;
                }
                
                // Match # Title
                const match = line.match(/^\s*#\s+(.*)/);
                if (match) {
                    let h1Text = (match[1] || '').trim();
                    h1Text = h1Text.replace(/\s+#+$/, '').trim();
                    if (h1Text === title) {
                        // Remove this line
                        if (i < lineCount - 1) {
                            editor.replaceRange('', { line: i, ch: 0 }, { line: i + 1, ch: 0 });
                        } else {
                            editor.replaceRange('', { line: i, ch: 0 }, { line: i, ch: line.length });
                        }
                        new Notice(`Removed redundant H1 from ${file.name}`);
                    }
                    break; // Only check the first H1
                }
                
                // Match Title\n=== (Setext H1)
                if (i < lineCount - 1) {
                    const nextLine = editor.getLine(i + 1);
                    if (nextLine.match(/^={3,}$/)) {
                        const h1Text = line.trim();
                        if (h1Text === title) {
                            // Remove both lines
                            if (i + 1 < lineCount - 1) {
                                editor.replaceRange('', { line: i, ch: 0 }, { line: i + 2, ch: 0 });
                            } else {
                                editor.replaceRange('', { line: i, ch: 0 }, { line: i + 1, ch: nextLine.length });
                            }
                            new Notice(`Removed redundant H1 from ${file.name}`);
                        }
                        break; // Only check the first H1
                    }
                }
            }
        }
    });

    // Vault-wide command
    plugin.addCommand({
        id: 'remove-redundant-h1-vault',
        name: 'Remove redundant H1 in entire vault',
        callback: async () => {
            const files = plugin.app.vault.getMarkdownFiles();
            let modifiedCount = 0;

            new Notice(`Checking ${files.length} markdown files for redundant H1s...`);

            for (const file of files) {
                const modified = await processFile(plugin, file);
                if (modified) {
                    modifiedCount++;
                }
            }

            new Notice(`Finished! Removed redundant H1s from ${modifiedCount} file(s).`);
        }
    });
}

async function processFile(plugin: Plugin, file: TFile): Promise<boolean> {
    const title = file.basename;
    const content = await plugin.app.vault.read(file);
    const lines = content.split(/\r?\n/);
    
    let inFrontmatter = false;
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        
        // Frontmatter handling
        if (i === 0 && line.trim() === '---') {
            inFrontmatter = true;
            continue;
        }
        if (inFrontmatter) {
            if (line.trim() === '---') {
                inFrontmatter = false;
            }
            continue;
        }
        
        // Match # Title
        const match = line.match(/^\s*#\s+(.*)/);
        if (match) {
            let h1Text = (match[1] || '').trim();
            h1Text = h1Text.replace(/\s+#+$/, '').trim();
            if (h1Text === title) {
                // Remove this line by filtering it out
                lines.splice(i, 1);
                modified = true;
            }
            break; // Only check the first H1
        }
        
        // Match Title\n=== (Setext H1)
        if (i < lines.length - 1) {
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.match(/^={3,}$/)) {
                const h1Text = line.trim();
                if (h1Text === title) {
                    // Remove both lines
                    lines.splice(i, 2);
                    modified = true;
                }
                break; // Only check the first H1
            }
        }
    }
    
    if (modified) {
        await plugin.app.vault.modify(file, lines.join('\n'));
        return true;
    }
    
    return false;
}
