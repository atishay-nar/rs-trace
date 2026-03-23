import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRelevance } from "@/lib/extract-relevance";


type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const paper = await prisma.paper.findUnique({ 
    where: { id },
    include: {projects: { include: { project: true } }},
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
