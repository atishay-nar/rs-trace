import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePaper } from "@/lib/resolve-paper";

export async function GET() {
    const papers = await prisma.paper.findMany({
        orderBy: {createdAt: "desc"},
        include: {project: true},
    });
    return NextResponse.json(papers);
}

export async function POST(request: Request) {
    const body = (await request.json()) as { input: string};
    const input = body?.input?.trim();
    
    if (!input) {
        return NextResponse.json(
            { error: "Enter a DOI or a arXiv ID" },
            { status: 400 }
        );
    }

    try {
        const resolved = await resolvePaper(input);

        const existing = resolved.doi
      ? await prisma.paper.findFirst({ where: { doi: resolved.doi } })
      : await prisma.paper.findFirst({ where: { arxivId: resolved.arxivId! } });

      if (existing) {
        return NextResponse.json(
            {error: "Paper already saved", paper: existing},
            {status: 409}
        );
      }

    const paper = await prisma.paper.create({
        data: {
            // to be filed in
            title: resolved.title,
            authors: resolved.authors,
            abstract: resolved.abstract,
            doi: resolved.doi,
            arxivId: resolved.arxivId,
            source: resolved.source,
            pdfUrl: resolved.pdfUrl,
            url: resolved.url,
            projectId: body?.projectId,
        },
    });

    return NextResponse.json(paper);
} catch (e) {

    const msg = e instanceof Error ? e.message : "Failed to fetch paper";
    return NextResponse.json({ error: msg }, { status: 400 });
}
}