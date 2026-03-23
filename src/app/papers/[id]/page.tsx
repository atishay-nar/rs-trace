import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatAuthors } from "@/lib/format-authors";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: { projects: { include: { project: true } } },
  });

  if (!paper) notFound();

  const authorsFormatted = formatAuthors(paper.authors);
  const firstProject = paper.projects[0];
  const relevanceScore = firstProject?.relevanceScore ?? paper.relevanceScore;
  const relevanceExplanation = firstProject?.relevanceExplanation ?? paper.relevanceExplanation;

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>

      <article className="space-y-8">
        <header className="pb-6 border-b border-[var(--divide)]">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight">
            {paper.title ?? "Untitled"}
          </h1>
          {authorsFormatted && (
            <p className="text-[var(--muted)] mt-2">{authorsFormatted}</p>
          )}
          <p className="text-sm text-[var(--muted)] mt-1">{paper.source}</p>
        </header>

        {paper.projects.length > 0 && (
          <section>
            <p className="text-sm font-medium text-[var(--muted)] mb-2">Projects</p>
            <ul className="text-sm space-y-1">
              {paper.projects.map((pp) => (
                <li key={pp.projectId}>
                  <Link
                    href={`/projects/${pp.projectId}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {pp.project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {firstProject?.project?.description && (
          <section>
            <p className="text-sm font-medium text-[var(--muted)] mb-2">Project focus</p>
            <p className="text-sm">{firstProject.project.description}</p>
          </section>
        )}

        {relevanceScore != null && (
          <section>
            <p className="font-medium">Relevance: {relevanceScore}/10</p>
            {relevanceExplanation && (
              <p className="text-sm text-[var(--muted)] mt-1 italic">{relevanceExplanation}</p>
            )}
          </section>
        )}

        {paper.abstract && (
          <section>
            <p className="text-sm font-medium text-[var(--muted)] mb-2">Abstract</p>
            <p className="text-sm leading-relaxed">{paper.abstract}</p>
          </section>
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
      </article>
    </div>
  );
}
