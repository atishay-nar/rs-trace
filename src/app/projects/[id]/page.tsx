import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RELEVANCE_THRESHOLD } from "@/lib/constants";
import { auth } from "@/auth";
import { Suggestions } from "./Suggestions";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { PaperList } from "./PaperList";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { papers: { include: { paper: true } } },
  });

  if (!project || project.userId !== session.user.id) notFound();

  const hasHighRelevance = project.papers.some(pp => {
    const score = pp.relevanceScore ?? pp.paper.relevanceScore ?? -1;
    return score >= RELEVANCE_THRESHOLD;
  });

  // Serialize dates for the client component
  const papers = project.papers.map(pp => ({
    paperId: pp.paperId,
    relevanceScore: pp.relevanceScore,
    relevanceExplanation: pp.relevanceExplanation,
    addedAt: pp.addedAt.toISOString(),
    paper: {
      id: pp.paper.id,
      title: pp.paper.title,
      relevanceScore: pp.paper.relevanceScore,
      relevanceExplanation: pp.paper.relevanceExplanation,
    },
  }));

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
        <PaperList projectId={project.id} papers={papers} />
      </section>

      <Suggestions projectId={project.id} hasHighRelevance={hasHighRelevance} />
    </div>
  );
}
