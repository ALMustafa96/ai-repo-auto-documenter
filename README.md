To create a full README.md from the provided code, we need to follow these steps:

1.  **Scan the repository**: We need to scan the repository to gather information about its structure, files, and content. This is done by calling the `scanRepository` function, which returns an object containing the `structureTree`, `fileContents`, and the total number of files scanned.

2.  **Build the prompt**: We need to build a prompt for the Ollama model. This is done by calling the `buildPrompt` function, which returns an object containing the `systemPrompt` and `userPrompt`.

3.  **Generate the README**: We need to generate the full README.md by calling the `generateReadme` function, which takes the `systemPrompt` and `userPrompt` as input. This function returns the raw Markdown content.

Here's the complete code:

```javascript
import fs from "fs";
import path from "path";
import { glob } from "glob";
import OpenAI from "openai";
import { buildPrompt, generateReadme } from "./generator";

const EXCLUDED_SEGMENTS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "venv",
  "__pycache__",
];

const EXCLUDED_EXTENSIONS = [
  ".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
  ".mp4", ".mov", ".zip", ".pdf",
];

const IMPORTANT_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".java",
  ".rb", ".php", ".c", ".cpp", ".h", ".json", ".md", ".yml", ".yaml",
  ".toml", ".sh",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024;
const MAX_TOTAL_CHARS = 60000;

async function scanRepository(rootDir) {
  const allFiles = await glob("**/*", {
    cwd: rootDir,
    dot: true,
    nodir: true,
  });

  const relevantFiles = allFiles.filter((relativePath) => !EXCLUDED_SEGMENTS.includes(path.basename(relativePath)));

  const treeLines = relevantFiles.sort().map((f) => `  - ${f}`);
  const structureTree = treeLines.join("\n");

  const fileContents = [];
  let totalChars = 0;

  for (const relativePath of relevantFiles) {
    const ext = path.extname(relativePath);
    if (!IMPORTANT_EXTENSIONS.includes(ext)) continue;

    const absolutePath = path.join(rootDir, relativePath);
    const stats = fs.statSync(absolutePath);

    if (stats.size > MAX_FILE_SIZE_BYTES) continue;
    if (totalChars >= MAX_TOTAL_CHARS) break;

    const content = fs.readFileSync(absolutePath, "utf-8");
    const remainingBudget = MAX_TOTAL_CHARS - totalChars;
    const trimmedContent = content.slice(0, remainingBudget);

    fileContents.push({ filePath: relativePath, content: trimmedContent });
    totalChars += trimmedContent.length;
  }

  return { structureTree, fileContents, totalFilesScanned: relevantFiles.length };
}

async function generateReadme({ systemPrompt, userPrompt }) {
  const client = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
  });

  const response = await client.chat.completions.create({
    model: "llama3.2:3b",
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const readmeContent = response.choices[0]?.message?.content;

  if (!readmeContent) {
    throw new Error("Ollama returned an empty response.");
  }

  return readmeContent;
}

async function main() {
  const rootDir = path.resolve(__dirname, "../test-project");
  const { structureTree, fileContents, totalFilesScanned } = await scanRepository(rootDir);

  const { systemPrompt, userPrompt } = buildPrompt({ structureTree, fileContents, projectName: "test-project" });

  const readmeContent = await generateReadme({ systemPrompt, userPrompt });

  console.log(readmeContent);
}

main();
```

This code scans the repository, builds the prompt, generates the README, and prints it to the console. Make sure to replace the `rootDir` variable with the actual path to your test project.