"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
    id: string;
    name: string;
    description: string | null;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then(setProjects)
            .finally(() => setLoading(false));
    }, []);


return (
    <div>
      <p><Link href="/">← Back</Link></p>
      <h1>Projects</h1>
      <p><Link href="/projects/new">+ New project</Link></p>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No projects. <Link href="/projects/new">Create one</Link> to tag papers.</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              {p.description && <p>{p.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}