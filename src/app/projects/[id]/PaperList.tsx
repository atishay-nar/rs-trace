"use client";

import { useState } from "react";
import Link from "next/link";
import { RemovePaperButton } from "./RemovePaperButton";

type PaperEntry = {
  paperId: string;
  relevanceScore: number | null;
  relevanceExplanation: string | null;
  addedAt: string;
  paper: {
    id: string;
    title: string | null;
    relevanceScore: number | null;
    relevanceExplanation: string | null;
  };
};

type Sort = "relevance" | "date";

export function PaperList({
  projectId,
  papers,
}: {
  projectId: string;
  papers: PaperEntry[];
}) {
  const [sort, setSort] = useState<Sort>("relevance");

  const sorted = [...papers].sort((a, b) => {
    if (sort === "relevance") {
      const scoreA = a.relevanceScore ?? a.paper.relevanceScore ?? -Infinity;
      const scoreB = b.relevanceScore ?? b.paper.relevanceScore ?? -Infinity;
      return scoreB - scoreA;
    }
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-[var(--muted)]">Papers</h2>
        <Link
          href={`/projects/${projectId}/add`}
          className="text-sm text-[var(--accent)] hover:underline font-medium"
        >
          + Add paper
        </Link>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setSort(s => s === "relevance" ? "date" : "relevance")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
        >
          Sort by: {sort === "relevance" ? "Relevance" : "Date added"}
        </button>
      </div>

      {papers.length === 0 ? (
        <p className="text-[var(--muted)]">
          No papers yet.{" "}
          <Link href={`/projects/${projectId}/add`} className="text-[var(--accent)] hover:underline">
            Add one
          </Link>.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--divide)]">
          {sorted.map((pp) => {
            const explanation = pp.relevanceExplanation ?? pp.paper.relevanceExplanation;
            return (
              <li key={pp.paperId} className="flex items-start justify-between gap-4 py-5 pr-2">
                <Link href={`/papers/${pp.paper.id}`} className="flex-1 min-w-0 group">
                  <span className="font-medium group-hover:text-[var(--accent)] transition-colors block">
                    {pp.paper.title ?? "Untitled"}
                  </span>
                  {explanation && (
                    <p className="text-sm text-[var(--muted)] mt-0.5">{explanation}</p>
                  )}
                </Link>
                <RemovePaperButton projectId={projectId} paperId={pp.paper.id} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
