"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div>
      <h1>Research Tracker</h1>
      <p>
        <Link href="/add">Add a paper</Link> · <Link href="/projects">Projects</Link>
      </p>
      <h2>Your papers</h2>
      {loading ? (
        <p>Loading...</p>
      ) : papers.length === 0 ? (
        <p>No papers yet. Add one above.</p>
      ) : (
        <ul>
          {papers.map((paper) => (
            <li key={paper.id}>
              <Link href={`/papers/${paper.id}`}><strong>{paper.title}</strong></Link>
              {" "}— {paper.authors} ({paper.source})
              {paper.project && ` · ${paper.project.name}`}
              {" "}
              <button onClick={() => handleDelete(paper.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}