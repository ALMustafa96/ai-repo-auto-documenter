import fs from "fs";
import path from "path";
import { glob } from "glob";

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

function isExcluded(relativePath) {
  const segments = relativePath.split(path.sep);
  if (segments.some((seg) => EXCLUDED_SEGMENTS.includes(seg))) return true;

  const ext = path.extname(relativePath);
  if (EXCLUDED_EXTENSIONS.includes(ext)) return true;

  return false;
}

export async function scanRepository(rootDir) {
  const allFiles = await glob("**/*", {
    cwd: rootDir,
    dot: true,
    nodir: true,
  });

  const relevantFiles = allFiles.filter((relativePath) => !isExcluded(relativePath));

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
