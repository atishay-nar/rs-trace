"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Project = { id: string; name: string };

export function ProjectSelector({
  paperId,
  currentProjectId,
}: {
  paperId: string;
  currentProjectId: string | null;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [value, setValue] = useState(currentProjectId ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects);
    setValue(currentProjectId ?? "");
  }, [currentProjectId]);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const projectId = e.target.value || null;
    setLoading(true);
    try {
      const res = await fetch(`/api/papers/${paperId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectId || null }),
      });
      if (res.ok) {
        setValue(projectId ?? "");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <h2 className="text-sm font-medium text-[var(--muted)] mb-2">Project</h2>
      <select
        value={value}
        onChange={handleChange}
        disabled={loading || projects.length === 0}
        className="w-full sm:w-auto min-w-[200px] px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
      >
        <option value="">None</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {projects.length === 0 && (
        <p className="text-sm text-[var(--muted)] mt-2">
          No projects yet. <Link href="/projects/new" className="text-[var(--accent)] hover:underline">Create one</Link>.
        </p>
      )}
    </div>
  );
}
