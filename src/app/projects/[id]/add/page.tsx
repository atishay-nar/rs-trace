"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AddPaperToProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [mode, setMode] = useState<"doi" | "pdf">("doi");
  const [doiInput, setDoiInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDoiSubmit(e: React.FormEvent) {
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

  async function handlePdfSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      setError("PDF file is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", pdfFile);
      formData.set("projectId", projectId);
      if (title.trim()) formData.set("title", title.trim());
      if (authors.trim()) formData.set("authors", authors.trim());

      const res = await fetch("/api/papers/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to upload");
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
    <div className="space-y-6">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add paper</h1>
        <p className="text-[var(--muted)] mt-1">Add by DOI/arXiv or upload a PDF.</p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setMode("doi")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${mode === "doi" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          DOI / arXiv
        </button>
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${mode === "pdf" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          Upload PDF
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {mode === "doi" ? (
        <form onSubmit={handleDoiSubmit} className="space-y-5">
          <div>
            <label htmlFor="doi" className="block text-sm font-medium mb-2">
              DOI or arXiv ID
            </label>
            <input
              id="doi"
              type="text"
              placeholder="e.g. 10.1234/example or 2301.12345"
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
      ) : (
        <form onSubmit={handlePdfSubmit} className="space-y-5">
          <div>
            <label htmlFor="pdf" className="block text-sm font-medium mb-2">
              PDF file
            </label>
            <input
              id="pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title <span className="text-[var(--muted)] font-normal">(optional)</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Paper title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="authors" className="block text-sm font-medium mb-2">
              Authors <span className="text-[var(--muted)] font-normal">(optional, comma-separated)</span>
            </label>
            <input
              id="authors"
              type="text"
              placeholder="Author One, Author Two"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !pdfFile}
            className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {loading ? "Uploading..." : "Add paper"}
          </button>
        </form>
      )}
    </div>
  );
}
