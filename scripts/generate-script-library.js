/* eslint-disable no-console */
// to run: npm run doc
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EA_SCRIPTS_DIR = path.join(ROOT, 'ea-scripts');
const INDEX_NEW = path.join(EA_SCRIPTS_DIR, 'index-new.md');
const OUT_DIR = path.join(path.join(ROOT, 'docs'), 'AITrainingData');
const SCRIPT_LIBRARY_OUT = path.join(OUT_DIR, 'Excalidraw Script Library.md');
const TYPE_DEF_OUT = path.join(OUT_DIR, 'Excalidraw Automate library file (not only) for LLM training.md');

const SCRIPT_INTRO = `# Excalidraw Script Library

This file is an automatically generated knowledge base intended for Retrieval Augmented Generation (RAG) and other AI-assisted workflows (e.g. NotebookLM or local embeddings tools).  
Its purpose:
- Provide a single, query-friendly corpus of all Excalidraw Automate scripts.
- Serve as a practical pattern and snippet library for developers learning Excalidraw Automate.
- Preserve original source side by side with the higher-level index (index-new.md) to improve semantic recall.
- Enable AI tools to answer questions about how to manipulate the Excalidraw canvas, elements, styling, or integration features by referencing real, working examples.

Content structure:
1. SCRIPT_INTRO (this section)
2. The curated script overview (index-new.md)
3. Raw source of every *.md script in /ea-scripts (each fenced code block is auto-closed to ensure well-formed aggregation)

Generated on: ${new Date().toISOString()}

---

`;

const TYPE_DEF_INTRO = `# Excalidraw Automate library (not only) file for LLM training

[Gemini](https://aistudio.google.com/) because of its very large context window (without subscription) is effective at developing ExcalidrawAutomate scripts. To achieve the best result I recommend attaching 3 files for these LLMs to use as reference.
1) The [Obsidian API library file](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts).
2) One or more ready made ExcalidrawAutomate scripts that do something remotely similar to what you want. You'll find a very extensive list of scripts [here](https://github.com/zsviczian/obsidian-excalidraw-plugin/tree/master/ea-scripts).
3) This library file for ExcalidrawAutomate that includes a more detailed description of each function, plus includes some general explanation about the logic of Excalidraw Automate intended for both hobby hackers and LLMs.

For more information about Excalidraw scripting visit my playlist on [YouTube](https://youtube.com/playlist?list=PL6mqgtMZ4NP3up3qjrWW69UwlPow0ZvzU&si=iWIF9pkQPdXYXOYc)

`;

/**
 * Returns true if content contains at least one line starting with ```
 * and has an odd number of fences (unbalanced).
 */
function needsClosingFence(content) {
  const fenceCount = (content.match(/^```/gm) || []).length;
  return fenceCount > 0 && fenceCount % 2 === 1;
}

function main() {
  console.log('[script-library] Generating Excalidraw Script Library...');
  if (!fs.existsSync(EA_SCRIPTS_DIR)) {
    console.error('ea-scripts directory not found:', EA_SCRIPTS_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(INDEX_NEW)) {
    console.error('index-new.md not found:', INDEX_NEW);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let output = SCRIPT_INTRO;

  console.log('[script-library] Adding index-new.md');
  const indexNewContent = fs.readFileSync(INDEX_NEW, 'utf8');
  output += `<!-- BEGIN index-new.md -->\n${indexNewContent.trim()}\n<!-- END index-new.md -->\n\n`;
  output += `---\n\n# Script Sources\n`;

  // Collect *.md files (non-recursive) excluding index-new.md
  const files = fs
    .readdirSync(EA_SCRIPTS_DIR, { withFileTypes: true })
    .filter(
      (d) =>
        d.isFile() &&
        d.name.endsWith('.md') &&
        d.name.toLowerCase() !== 'index-new.md'
    )
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  for (const file of files) {
    const full = path.join(EA_SCRIPTS_DIR, file);
    let content = fs.readFileSync(full, 'utf8');

    output += `\n---\n\n## ${file}\n`;
    output += `<!-- Source: ea-scripts/${file} -->\n\n`;

    // Normalize line endings
    content = content.replace(/\r\n/g, '\n');

    output += content.trimEnd() + '\n';

    if (needsClosingFence(content)) {
      output += '```\n';
      console.log(`[script-library] Added missing closing fence to ${file}`);
    } else {
      console.log(`[script-library] Added ${file} (no fence fix needed)`);
    }
  }

  fs.writeFileSync(SCRIPT_LIBRARY_OUT, output, 'utf8');
  console.log('[script-library] Wrote:', SCRIPT_LIBRARY_OUT);
  console.log('[script-library] Done.');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('[script-library] Failed:', e);
    process.exit(1);
  }
}
