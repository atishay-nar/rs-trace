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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data)) {
          setProjects(data);
          setError(null);
        } else {
          setError((data as { error?: string })?.error ?? "Failed to load");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Literature Review Manager</h1>
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
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : projects.length === 0 ? (
          <p className="text-[var(--muted)]">
            No projects yet. <Link href="/projects/new" className="text-[var(--accent)] hover:underline">Create one</Link> to add papers.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--divide)]">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="block py-5 pr-4 hover:text-[var(--accent)] transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  {p.description && (
                    <p className="text-sm text-[var(--muted)] mt-0.5 line-clamp-2">{p.description}</p>
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
