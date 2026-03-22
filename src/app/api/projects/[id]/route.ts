import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

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
