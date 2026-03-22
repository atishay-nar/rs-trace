import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatAuthors } from "@/lib/format-authors";

type Props = { params: Promise<{ id: string }> };

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!paper) notFound();

  const authorsFormatted = formatAuthors(paper.authors);

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>
      <header className="pb-6 border-b border-[var(--border)]">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight">{paper.title}</h1>
        <p className="text-[var(--muted)] mt-2">{authorsFormatted}</p>
        <p className="text-sm text-[var(--muted)] mt-1">{paper.source}</p>
      </header>
      {paper.project && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="font-medium">Project: {paper.project.name}</p>
          {paper.project.description && (
            <p className="text-sm text-[var(--muted)] mt-1">{paper.project.description}</p>
          )}
        </div>
      )}
      {paper.relevanceScore != null && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="font-medium">Relevance: {paper.relevanceScore}/10</p>
          {paper.relevanceExplanation && (
            <p className="text-sm text-[var(--muted)] mt-1 italic">{paper.relevanceExplanation}</p>
          )}
        </div>
      )}
      {paper.abstract && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm font-medium text-[var(--muted)] mb-2">Abstract</h2>
          <p className="text-sm leading-relaxed">{paper.abstract}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-4 pt-2">
        {paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline text-sm font-medium"
          >
            View paper
          </a>
        )}
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline text-sm font-medium"
          >
            PDF
          </a>
        )}
      </div>
    </div>
  );
}