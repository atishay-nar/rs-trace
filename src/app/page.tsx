"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatAuthors } from "@/lib/format-authors";

type Paper = {
  id: string;
  title: string;
  authors: string;
  source: string;
  project?: { name: string } | null;
};

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/papers")
      .then((res) => res.json())
      .then((data) => {
        setPapers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/papers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPapers((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Research Tracker</h1>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/add"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Add paper
          </Link>
          <Link
            href="/projects"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Projects
          </Link>
        </nav>
      </header>
      <section>
        <h2 className="text-lg font-medium text-[var(--muted)] mb-4">Your papers</h2>
        {loading ? (
          <p className="text-[var(--muted)]">Loading...</p>
        ) : papers.length === 0 ? (
          <p className="text-[var(--muted)]">
            No papers yet. <Link href="/add" className="text-[var(--accent)] hover:underline">Add one</Link>.
          </p>
        ) : (
          <ul className="space-y-3">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted)] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/papers/${paper.id}`}
                      className="font-medium hover:text-[var(--accent)] transition-colors line-clamp-2"
                    >
                      {paper.title}
                    </Link>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      {formatAuthors(paper.authors, 3)} · {paper.source}
                      {paper.project && ` · ${paper.project.name}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(paper.id)}
                    className="text-sm text-red-500 hover:text-red-600 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}