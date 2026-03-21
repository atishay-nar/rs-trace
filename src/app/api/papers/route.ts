import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const papers = await prisma.paper.findMany({
        orderBy: {createdAt: "desc"}
    });
    return NextResponse.json(papers);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, authors, source } = body;

    if (!title || !authors || !source) {
        return NextResponse.json(
            { error: "Missing title, authors, or source" },
            { status: 400 }
        );
    }

    const paper = await prisma.paper.create({
        data: {
            title,
            authors,
            source,
            abstract: body.abstract ?? null,
            doi: body.doi ?? null,
            arxivId: body.arxivId ?? null,
            pdfUrl: body.pdfUrl ?? null
        },

    });

    return NextResponse.json(paper)
}