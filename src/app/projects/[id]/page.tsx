import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suggestions } from "./Suggestions";
import { DeleteProjectButton } from "./DeleteProjectButton";


type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { papers: true },
  });

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-[var(--muted)] mt-2">{project.description}</p>
          )}
        </div>
        <DeleteProjectButton projectId={project.id} />
      </header>
      <section>
        <h2 className="text-lg font-medium text-[var(--muted)] mb-4">Papers</h2>
        {project.papers.length === 0 ? (
          <p className="text-[var(--muted)]">No papers yet.</p>
        ) : (
          <ul className="space-y-3">
            {project.papers.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/papers/${p.id}`}
                  className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted)] transition-colors"
                >
                  <span className="font-medium hover:text-[var(--accent)] transition-colors">{p.title}</span>
                  {p.relevanceScore != null && (
                    <p className="text-sm text-[var(--muted)] mt-1">
                      Relevance: {p.relevanceScore}/10{p.relevanceExplanation ? ` — ${p.relevanceExplanation}` : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Suggestions projectId={project.id} />
    </div>
  );
}