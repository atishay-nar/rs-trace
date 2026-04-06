import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { extractRelevance } from "@/lib/extract-relevance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string; paperId: string }> };

async function assertOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return project?.userId === userId ? project : null;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id: projectId, paperId } = await params;
  const project = await assertOwnership(projectId, session.user.id);
  if (!project) return new Response("Not found", { status: 404 });

  const { feedback } = await req.json() as { feedback: boolean };

  const link = await prisma.projectPaper.findUnique({
    where: { projectId_paperId: { projectId, paperId } },
    include: { paper: true },
  });

  const updateData: { feedback: boolean; relevanceExplanation?: string; relevanceScore?: number } = { feedback };

  if (feedback === true && link && !link.relevanceExplanation) {
    if (project.description) {
      try {
        const rel = await extractRelevance(
          project.description,
          link.paper.title ?? "Untitled",
          link.paper.abstract,
          true
        );
        if (rel?.explanation) {
          updateData.relevanceExplanation = rel.explanation;
          updateData.relevanceScore = rel.score;
        }
      } catch (e) {
        console.error("Relevance extraction failed:", e);
      }
    }
  }

  await prisma.projectPaper.update({
    where: { projectId_paperId: { projectId, paperId } },
    data: updateData,
  });
  return new Response(null, { status: 204 });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, paperId } = await params;
  const project = await assertOwnership(projectId, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const link = await prisma.projectPaper.findUnique({
      where: { projectId_paperId: { projectId, paperId } },
    });
    if (!link) {
      return NextResponse.json({ error: "Paper not in project" }, { status: 404 });
    }

    await prisma.projectPaper.delete({
      where: { projectId_paperId: { projectId, paperId } },
    });

    const otherProjects = await prisma.projectPaper.count({ where: { paperId } });
    if (otherProjects === 0) {
      await prisma.paper.delete({ where: { id: paperId } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove paper" }, { status: 500 });
  }
}
