import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suggestions } from "./Suggestions";


type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { papers: true },
  });

  if (!project) notFound();

  return (
    <div>
      <p><Link href="/projects">← Back</Link></p>
      <h1>{project.name}</h1>
      {project.description && <p>{project.description}</p>}
      <h2>Papers</h2>
      {project.papers.length === 0 ? (
        <p>No papers yet.</p>
      ) : (
        <ul>
          {project.papers.map((p) => (
            <li key={p.id}>
              <Link href={`/papers/${p.id}`}>{p.title}</Link>
              {p.relevanceScore != null && (
                <span> — {p.relevanceScore}/10{p.relevanceExplanation ? ` (${p.relevanceExplanation})` : ""}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <Suggestions projectId={project.id} />
    </div>
  );
}