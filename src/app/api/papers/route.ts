import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePaper } from "@/lib/resolve-paper";
import { extractRelevance } from "@/lib/extract-relevance";

export const dynamic = "force-dynamic";

export async function GET() {
    const papers = await prisma.paper.findMany({
        orderBy: {createdAt: "desc"},
        include: {projects: { include: { project: true } }},
    });
    return NextResponse.json(papers);
}

export async function POST(request: Request) {
    const body = (await request.json()) as { input?: string; projectId?: string };
    const input = body?.input?.trim();
    const projectId = body?.projectId?.trim();
  
    if (!input) {
      return NextResponse.json(
        { error: "Enter a DOI or a arXiv ID" },
        { status: 400 }
      );
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }
  
    try {
      const resolved = await resolvePaper(input);
  
      const existing = resolved.doi
        ? await prisma.paper.findFirst({ where: { doi: resolved.doi } })
        : await prisma.paper.findFirst({ where: { arxivId: resolved.arxivId! } });
  
      if (existing) {
        // Paper exists: create ProjectPaper only (add to project)
        const alreadyInProject = await prisma.projectPaper.findUnique({
          where: { projectId_paperId: { projectId, paperId: existing.id } },
        });
        if (alreadyInProject) {
          return NextResponse.json(
            { error: "Paper already in this project", paper: existing },
            { status: 409 }
          );
        }
  
        await prisma.projectPaper.create({
          data: { projectId, paperId: existing.id },
        });
  
        const project = await prisma.project.findUnique({
          where: { id: projectId },
        });
        if (project?.description) {
          try {
            const rel = await extractRelevance(
              project.description,
              existing.title ?? "Untitled",
              existing.abstract
            );
            if (rel) {
              await prisma.projectPaper.update({
                where: { projectId_paperId: { projectId, paperId: existing.id } },
                data: {
                  relevanceScore: rel.score,
                  relevanceExplanation: rel.explanation,
                },
              });
            }
          } catch (e) {
            console.error("Relevance extraction failed:", e);
          }
        }
  
        const updated = await prisma.paper.findUnique({
          where: { id: existing.id },
          include: { projects: { include: { project: true } } },
        });
        return NextResponse.json(updated);
      }
  
      // New paper: create Paper + ProjectPaper
      const paper = await prisma.paper.create({
        data: {
          title: resolved.title,
          authors: resolved.authors,
          abstract: resolved.abstract,
          doi: resolved.doi,
          arxivId: resolved.arxivId,
          source: resolved.source,
          pdfUrl: resolved.pdfUrl,
          url: resolved.url,
        },
      });
  
      await prisma.projectPaper.create({
        data: { projectId, paperId: paper.id },
      });
  
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (project?.description) {
        try {
          const rel = await extractRelevance(
            project.description,
            paper.title ?? "Untitled",
            paper.abstract
          );
          if (rel) {
            await prisma.projectPaper.update({
              where: { projectId_paperId: { projectId, paperId: paper.id } },
              data: {
                relevanceScore: rel.score,
                relevanceExplanation: rel.explanation,
              },
            });
          }
        } catch (e) {
          console.error("Relevance extraction failed:", e);
        }
      }
  
      const withProjects = await prisma.paper.findUnique({
        where: { id: paper.id },
        include: { projects: { include: { project: true } } },
      });
      return NextResponse.json(withProjects);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch paper";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }