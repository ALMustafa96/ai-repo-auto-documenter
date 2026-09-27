import fs from "fs";
import path from "path";
import { glob } from "glob";
import ignore from "ignore";

// Hardcoded defaults that are always excluded, regardless of .gitignore content
const DEFAULT_IGNORES = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  "venv/**",
  "__pycache__/**",
  "*.lock",
  "package-lock.json",
  "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico",
  "*.mp4", "*.mov", "*.zip", "*.pdf",
];

// Extensions we consider "important source code" worth sending full content for
const IMPORTANT_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".java",
  ".rb", ".php", ".c", ".cpp", ".h", ".json", ".md", ".yml", ".yaml",
  ".toml", ".env.example", ".Dockerfile", ".sh",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50KB per file cap
const MAX_TOTAL_CHARS = 60000; // total character budget sent to the model

/**
 * Loads the target repo's .gitignore (if present) into an `ignore` instance,
 * merged with our own default exclusions.
 */
function buildIgnoreFilter(rootDir) {
  const ig = ignore().add(DEFAULT_IGNORES);
  const gitignorePath = path.join(rootDir, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    ig.add(content);
  }

  return ig;
}

/**
 * Scans the repository and returns:
 *  - a text "tree" representation of the structure
 *  - an array of { filePath, content } for important files, size-capped
 */
export async function scanRepository(rootDir) {
  const ig = buildIgnoreFilter(rootDir);

  const allFiles = await glob("**/*", {
    cwd: rootDir,
    dot: true,
    nodir: true,
  });

  const relevantFiles = allFiles.filter((relativePath) => {
    return !ig.ignores(relativePath);
  });

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
