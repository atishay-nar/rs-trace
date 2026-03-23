"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AddPaperToProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [doiInput, setDoiInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: doiInput.trim(),
          projectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add paper</h1>
        <p className="text-[var(--muted)] mt-1">Enter a DOI or arXiv ID.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
        <div>
          <label htmlFor="doi" className="block text-sm font-medium text-[var(--muted)] mb-1">
            DOI or arXiv ID
          </label>
          <input
            id="doi"
            type="text"
            placeholder="e.g. 10.1234/example or 2301.12345"
            value={doiInput}
            onChange={(e) => setDoiInput(e.target.value)}
            className="w-full py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !doiInput.trim()}
          className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Fetching..." : "Add paper"}
        </button>
      </form>
    </div>
  );
}
