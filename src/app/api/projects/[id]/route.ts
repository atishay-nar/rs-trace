import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const links = await prisma.projectPaper.findMany({
      where: { projectId: id },
      select: { paperId: true },
    });
    const paperIds = links.map((l) => l.paperId);

    for (const paperId of paperIds) {
      const otherProjects = await prisma.projectPaper.count({
        where: { paperId, projectId: { not: id } },
      });
      if (otherProjects === 0) {
        await prisma.paper.delete({ where: { id: paperId } });
      }
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
