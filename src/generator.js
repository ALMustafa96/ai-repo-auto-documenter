import OpenAI from "openai";

export async function generateReadme({ systemPrompt, userPrompt }) {
  // Point the OpenAI SDK at the local Ollama server instead of OpenAI's API.
  // No API key needed — Ollama runs entirely on your machine for free.
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
