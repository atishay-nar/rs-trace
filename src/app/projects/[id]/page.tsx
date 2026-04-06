import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RELEVANCE_THRESHOLD } from "@/lib/constants";
import { Suggestions } from "./Suggestions";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { RemovePaperButton } from "./RemovePaperButton";
import { MarkRelevantButton } from "./MarkRelevantButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { papers: { include: { paper: true } } },
  });

  if (!project) notFound();

  const surfaced = project.papers.filter(pp => {
    const score = pp.relevanceScore ?? pp.paper.relevanceScore ?? -1;
    return score >= RELEVANCE_THRESHOLD || pp.feedback === true;
  });
  const belowThreshold = project.papers.filter(pp => {
    const score = pp.relevanceScore ?? pp.paper.relevanceScore;
    return score != null && score < RELEVANCE_THRESHOLD && pp.feedback !== true;
  });
  const unscored = project.papers.filter(
    pp => (pp.relevanceScore ?? pp.paper.relevanceScore) == null
  );

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[var(--divide)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-[var(--muted)] mt-2">{project.description}</p>
          )}
        </div>
        <DeleteProjectButton projectId={project.id} />
      </header>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-medium text-[var(--muted)]">Papers</h2>
          <Link
            href={`/projects/${project.id}/add`}
            className="text-sm text-[var(--accent)] hover:underline font-medium"
          >
            + Add paper
          </Link>
        </div>

        {project.papers.length === 0 ? (
          <p className="text-[var(--muted)]">No papers yet. <Link href={`/projects/${project.id}/add`} className="text-[var(--accent)] hover:underline">Add one</Link>.</p>
        ) : (
          <>
            <ul className="divide-y divide-[var(--divide)]">
              {surfaced.map((pp) => {
                const explanation = pp.relevanceExplanation ?? pp.paper.relevanceExplanation;
                return (
                  <li key={pp.paperId} className="flex items-start justify-between gap-4 py-5 pr-2">
                    <Link
                      href={`/papers/${pp.paper.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <span className="font-medium group-hover:text-[var(--accent)] transition-colors block">
                        {pp.paper.title ?? "Untitled"}
                      </span>
                      {explanation && (
                        <p className="text-sm text-[var(--muted)] mt-0.5">{explanation}</p>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <RemovePaperButton projectId={project.id} paperId={pp.paper.id} />
                    </div>
                  </li>
                );
              })}
              {unscored.map((pp) => (
                <li key={pp.paperId} className="flex items-start justify-between gap-4 py-5 pr-2">
                  <Link
                    href={`/papers/${pp.paper.id}`}
                    className="flex-1 min-w-0 group"
                  >
                    <span className="font-medium group-hover:text-[var(--accent)] transition-colors block">
                      {pp.paper.title ?? "Untitled"}
                    </span>
                  </Link>
                  <RemovePaperButton projectId={project.id} paperId={pp.paper.id} />
                </li>
              ))}
            </ul>

            {belowThreshold.length > 0 && (
              <details className="mt-4">
                <summary className="text-sm text-[var(--muted)] cursor-pointer select-none">
                  Other papers ({belowThreshold.length})
                </summary>
                <ul className="divide-y divide-[var(--divide)] mt-2">
                  {belowThreshold.map((pp) => (
                    <li key={pp.paperId} className="flex items-start justify-between gap-4 py-4 pr-2">
                      <Link
                        href={`/papers/${pp.paper.id}`}
                        className="flex-1 min-w-0 group"
                      >
                        <span className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors block text-[var(--muted)]">
                          {pp.paper.title ?? "Untitled"}
                        </span>
                      </Link>
                      <MarkRelevantButton projectId={project.id} paperId={pp.paper.id} />
                      <RemovePaperButton projectId={project.id} paperId={pp.paper.id} />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </section>

      <Suggestions projectId={project.id} />
    </div>
  );
}
