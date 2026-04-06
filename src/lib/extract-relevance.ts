import OpenAI from "openai";
import { RELEVANCE_THRESHOLD } from "./constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i]!, 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (magA * magB);
}

export async function extractRelevance(
    projectDesc: string,
    title: string,
    abstract: string | null,
    forceExplanation = false
): Promise<{score: number; explanation: string} | null> {
    if (!process.env.OPENAI_API_KEY) return null;

    const paperText = `${title}${abstract ? `. ${abstract.slice(0, 500)}` : ""}`;

    const [projectEmbed, paperEmbed] = await Promise.all([
        openai.embeddings.create({ model: "text-embedding-3-small", input: projectDesc }),
        openai.embeddings.create({ model: "text-embedding-3-small", input: paperText }),
    ]);

    const score = Math.round(
        cosineSimilarity(projectEmbed.data[0]!.embedding, paperEmbed.data[0]!.embedding) * 100
    ) / 10;

    if (score < RELEVANCE_THRESHOLD && !forceExplanation) return { score, explanation: "" };

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
            role: "user",
            content: `Project: ${projectDesc}\n\nPaper: "${title}"${abstract ? `\nAbstract: ${abstract.slice(0, 500)}` : ""}\n\nIn 1-2 sentences, explain why this paper is relevant to the project.`,
        }],
        temperature: 0,
    });

    return { score, explanation: res.choices[0]?.message?.content?.trim() ?? "" };
}
