export function buildPrompt({ structureTree, fileContents, projectName }) {
  const systemPrompt = `You are a senior software engineer and technical writer.
Your job is to write a professional, detailed, well-structured README.md
for the given repository. Use proper Markdown: headings, badges placeholders,
code blocks, and sections such as: Project Title, Description, Features,
Tech Stack, Installation, Usage, Project Structure, Configuration,
Contributing, and License.
Infer the purpose of the project from the file structure and code content.
Do not invent features that clearly don't exist in the code.
Return ONLY the raw Markdown content, with no extra commentary.`;

  const filesSection = fileContents
    .map((f) => `### File: ${f.filePath}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  const userPrompt = `Project name (folder): ${projectName}

## Repository Structure
${structureTree}

## Key File Contents
${filesSection}

Generate the full README.md now.`;

  return { systemPrompt, userPrompt };
}
