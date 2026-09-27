import OpenAI from "openai";

export async function generateReadme({ systemPrompt, userPrompt, apiKey }) {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const readmeContent = response.choices[0]?.message?.content;

  if (!readmeContent) {
    throw new Error("OpenAI returned an empty response.");
  }

  return readmeContent;
}
