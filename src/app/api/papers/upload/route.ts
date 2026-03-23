import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const projectId = formData.get("projectId") as string | null;
      const title = (formData.get("title") as string)?.trim();
      const authors = (formData.get("authors") as string)?.trim();
      if (!file || !projectId) {
        return NextResponse.json(
          { error: "file and projectId are required" },
          { status: 400 }
        );
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "File must be a PDF" },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "File must be under 10MB" },
          { status: 400 }
        );
      }
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      await mkdir(UPLOAD_DIR, { recursive: true });
      const filename = `${crypto.randomUUID()}.pdf`;
      const filepath = path.join(UPLOAD_DIR, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      const localPath = `uploads/${filename}`;
      const baseName = path.basename(file.name, path.extname(file.name));
      const finalTitle = title || baseName || null;
      const authorsList = authors ? authors.split(",").map((a) => a.trim()).filter(Boolean) : [];
      const authorsJson = authorsList.length > 0 ? JSON.stringify(authorsList) : null;
      const paper = await prisma.paper.create({
        data: {
          title: finalTitle,
          authors: authorsJson,
          abstract: null,
          doi: null,
          arxivId: null,
          source: "upload",
          pdfUrl: null,
          localPath,
          url: null,
        },
      });
      await prisma.projectPaper.create({
        data: {
          projectId,
          paperId: paper.id,
        },
      });
      return NextResponse.json(paper);
    } catch (e) {
      console.error("Upload error:", e);
      return NextResponse.json(
        { error: "Failed to upload paper" },
        { status: 500 }
      );
    }
  }