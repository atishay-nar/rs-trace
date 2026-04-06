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

export function Suggestions({ projectId, hasHighRelevance }: { projectId: string; hasHighRelevance: boolean }) {
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

  if (!hasHighRelevance) return null;

  return (
    <section className="pt-6 border-t border-[var(--divide)]">
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="text-sm font-medium text-[var(--accent)] hover:underline disabled:opacity-50"
      >
        {loading ? "Loading..." : "Suggested papers"}
      </button>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="divide-y divide-[var(--divide)] mt-6">
          {suggestions.map((s) => (
            <li key={s.title + (s.arxivId ?? s.doi ?? "")} className="py-5">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-[var(--accent)] transition-colors block"
              >
                {s.title}
              </a>
              {s.authors && (
                <p className="text-sm text-[var(--muted)] mt-0.5">{s.authors}</p>
              )}
              <button
                type="button"
                onClick={() => addToProject(s)}
                disabled={!canAdd(s) || addingId === s.title}
                className="mt-2 text-sm text-[var(--accent)] hover:underline font-medium disabled:opacity-50"
              >
                {addingId === s.title ? "Adding..." : "+ Add to project"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
