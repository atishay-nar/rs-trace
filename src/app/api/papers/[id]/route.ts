import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    await prisma.paper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
}