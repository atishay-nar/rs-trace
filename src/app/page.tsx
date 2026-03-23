"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Research Tracker</h1>
        <Link
          href="/projects/new"
          className="inline-flex px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          New project
        </Link>
      </header>
      <section>
        <h2 className="text-lg font-medium text-[var(--muted)] mb-4">Projects</h2>
        {loading ? (
          <p className="text-[var(--muted)]">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-[var(--muted)]">
            No projects yet. <Link href="/projects/new" className="text-[var(--accent)] hover:underline">Create one</Link> to add papers.
          </p>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted)] transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  {p.description && (
                    <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">{p.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}