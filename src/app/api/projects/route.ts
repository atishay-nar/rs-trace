import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (e) {
    console.error("GET /api/projects:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { name?: string; description?: string };
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const project = await prisma.project.create({
      data: {
        name,
        description: body?.description?.trim() || null,
        userId: session.user.id,
      },
    });
    return NextResponse.json(project);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database error";
    console.error("POST /api/projects:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
