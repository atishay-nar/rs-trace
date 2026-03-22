import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
