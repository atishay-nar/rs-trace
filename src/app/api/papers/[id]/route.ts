import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRelevance } from "@/lib/extract-relevance";


type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const paper = await prisma.paper.findUnique({ 
    where: { id },
    include: {project: true},
   });

   if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
   }

   return NextResponse.json(paper);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    await prisma.paper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as { projectId?: string | null };
  try {
    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper) return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    const projectId = body.projectId === "" ? null : body.projectId ?? undefined;
    const updated = await prisma.paper.update({
      where: { id },
      data: { projectId: projectId ?? undefined },
    });
    if (projectId) {
      try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project?.description) {
          const rel = await extractRelevance(project.description, paper.title, paper.abstract);
          if (rel) {
            const withRel = await prisma.paper.update({
              where: { id },
              data: { relevanceScore: rel.score, relevanceExplanation: rel.explanation },
            });
            return NextResponse.json(withRel);
          }
        }
      } catch (e) {
        console.error("Relevance extraction failed:", e);
      }
    } else {
      await prisma.paper.update({
        where: { id },
        data: { relevanceScore: null, relevanceExplanation: null },
      });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
}