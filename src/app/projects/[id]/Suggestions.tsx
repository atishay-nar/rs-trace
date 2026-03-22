"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = {
  arxivId?: string;
  doi?: string;
  title: string;
  authors: string;
  abstract: string | null;
  url: string;
};

export function Suggestions({ projectId }: { projectId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/suggestions`);
      const data = await r.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function addToProject(s: Suggestion) {
    const input = s.arxivId ?? s.doi ?? "";
    if (!input) {
      setError("This paper has no DOI or arXiv ID — can't add it.");
      return;
    }
    setAddingId(s.title);
    setError(null);
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add paper");
        return;
      }
      setSuggestions((prev) => prev.filter((x) => x.title !== s.title || (x.arxivId !== s.arxivId && x.doi !== s.doi)));
      router.refresh();
    } finally {
      setAddingId(null);
    }
  }

  const canAdd = (s: Suggestion) => s.arxivId ?? s.doi;

  return (
    <div>
      <h2>Suggestions</h2>
      <button onClick={fetchSuggestions} disabled={loading}>
        {loading ? "Loading..." : "Get suggestions"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((s) => (
            <li key={s.title + (s.arxivId ?? s.doi ?? "")}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
              {s.authors && <span> — {s.authors}</span>}
              <button
                type="button"
                onClick={() => addToProject(s)}
                disabled={!canAdd(s) || addingId === s.title}
              >
                {addingId === s.title ? "Adding..." : "Add to project"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}