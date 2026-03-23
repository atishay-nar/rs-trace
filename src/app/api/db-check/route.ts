import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.project.count();
    const dbHost = process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")?.split("/")[2]?.split("?")[0] ?? "unknown";
    return NextResponse.json({
      ok: true,
      message: "Database connected",
      projectsCount: count,
      dbHost,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
