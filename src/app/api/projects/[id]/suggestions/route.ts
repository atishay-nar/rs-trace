import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/semantic-scholar";


type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { papers: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const positiveIds: string[] = [];
    for (const p of project.papers.slice(0, 10)) {
      if (p.arxivId) positiveIds.push(`ArXiv:${p.arxivId}`);
      else if (p.doi) positiveIds.push(`DOI:${p.doi}`);
    }

    if (positiveIds.length === 0) return NextResponse.json([]);

    const suggestions = await getRecommendations(positiveIds);

    const existingArxiv = new Set(project.papers.map((p) => p.arxivId).filter(Boolean) as string[]);
    const existingDoi = new Set(project.papers.map((p) => p.doi).filter(Boolean) as string[]);
    const allPapers = await prisma.paper.findMany({ select: { arxivId: true, doi: true } });
    for (const p of allPapers) {
        if (p.arxivId) existingArxiv.add(p.arxivId);
        if (p.doi) existingDoi.add(p.doi);
    }
    const filtered = suggestions
        .filter((s) => !(s.arxivId && existingArxiv.has(s.arxivId)))
        .filter((s) => !(s.doi && existingDoi.has(s.doi)))
        .slice(0, 5);
    return NextResponse.json(filtered);
}

