import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractRelevance(
    projectDesc: string,
    title: string,
    abstract: string | null
): Promise<{score: number; explanation: string} | null> {
    if (!process.env.OPENAI_API_KEY) return null;
    const content = `Project: ${projectDesc}\n\nPaper: "${title}"${abstract ? `\nAbstract: ${abstract.slice(0, 500)}` : ""}\n\nRate relevance from 0 (completely irrelevant) to 10 (directly on topic).
Use 0-3 for tangential, 4-6 for related, 7-10 for highly relevant. Give a 1-3 sentence explanation of relevance to the project. Format: SCORE|EXPLANATION`;

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content }],
        temperature: 0
      });

    const text = res.choices[0]?.message?.content?.trim();
    if (!text) return null;

    const [scoreStr, ...rest] = text.split("|");
    const score = parseFloat(scoreStr ?? "0");
    const explanation = rest.join("|").trim() || "No explanation";
    return { score: isNaN(score) ? 0 : score, explanation };


}