import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!paper) notFound();

  const authors = JSON.parse(paper.authors) as string[];

  return (
    <div>
      <p><Link href="/">← Back</Link></p>
      <h1>{paper.title}</h1>
      <p>By: {authors.join(", ")}</p>
      <p>Source: {paper.source}</p>
      {paper.project && (
        <div>
          <p>Project: {paper.project.name}</p>
          {paper.project.description && (
            <p>Project description: {paper.project.description}</p>
          )}
        </div>
      )}
      {paper.relevanceScore != null && (
      <p>Relevance to project: {paper.relevanceScore}/10 — <i>{paper.relevanceExplanation}</i></p>
      )}
      {paper.abstract && <p>Abstract: {paper.abstract}</p>}
      {paper.url && (
        <a href={paper.url} target="_blank" rel="noopener noreferrer">View paper</a>
      )}
      {paper.pdfUrl && (
        <> · <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">PDF</a></>
      )}
    </div>
  );
}