import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string; paperId: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id: projectId, paperId } = await params;
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

    const otherProjects = await prisma.projectPaper.count({
      where: { paperId },
    });
    if (otherProjects === 0) {
      await prisma.paper.delete({ where: { id: paperId } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove paper" }, { status: 500 });
  }
}
