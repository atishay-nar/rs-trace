import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/semantic-scholar";
import { RELEVANCE_THRESHOLD } from "@/lib/constants";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { papers: { include: { paper: true } } },
    });
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const highRelevance = project.papers.filter(
        pp => (pp.relevanceScore ?? pp.paper.relevanceScore ?? 0) >= RELEVANCE_THRESHOLD
    );
    const source = highRelevance.length > 0 ? highRelevance : project.papers;
    const positiveIds: string[] = [];
    for (const pp of source.slice(0, 10)) {
      const p = pp.paper;
      if (p.arxivId) positiveIds.push(`ArXiv:${p.arxivId}`);
      else if (p.doi) positiveIds.push(`DOI:${p.doi}`);
    }

    if (positiveIds.length === 0) return NextResponse.json([]);

    const suggestions = await getRecommendations(positiveIds);

    const existingArxiv = new Set(project.papers.map((pp) => pp.paper.arxivId).filter(Boolean) as string[]);
    const existingDoi = new Set(project.papers.map((pp) => pp.paper.doi).filter(Boolean) as string[]);
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
