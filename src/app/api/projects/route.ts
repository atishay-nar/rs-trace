import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const body = (await request.json()) as { name?: string; description?: string };
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const project = await prisma.project.create({
      data: {
        name,
        description: body?.description?.trim() || null,
      },
    });
    return NextResponse.json(project);
  }

  export async function DELETE(_req: Request, { params }: RouteParams) {
    const { id } = await params;
    try {
      await prisma.paper.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });
      await prisma.project.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }
  