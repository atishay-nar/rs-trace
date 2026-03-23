import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suggestions } from "./Suggestions";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { RemovePaperButton } from "./RemovePaperButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { papers: { include: { paper: true } } },
  });

  if (!project) notFound();

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
          <ul className="divide-y divide-[var(--divide)]">
            {project.papers.map((pp) => (
              <li key={pp.paperId} className="flex items-start justify-between gap-4 py-5 pr-2">
                <Link
                  href={`/papers/${pp.paper.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <span className="font-medium group-hover:text-[var(--accent)] transition-colors block">
                    {pp.paper.title ?? "Untitled"}
                  </span>
                  {((pp.relevanceScore ?? pp.paper.relevanceScore) != null) && (
                    <p className="text-sm text-[var(--muted)] mt-0.5">
                      {pp.relevanceScore ?? pp.paper.relevanceScore}/10
                      {(pp.relevanceExplanation ?? pp.paper.relevanceExplanation) &&
                        ` — ${pp.relevanceExplanation ?? pp.paper.relevanceExplanation}`}
                    </p>
                  )}
                </Link>
                <RemovePaperButton projectId={project.id} paperId={pp.paper.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Suggestions projectId={project.id} />
    </div>
  );
}
