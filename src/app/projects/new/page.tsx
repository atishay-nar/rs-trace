"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--muted)] mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--muted)] mb-1">
            Description <span className="font-normal">(used for relevance extraction)</span>
          </label>
          <textarea
            id="description"
            placeholder="What is this project about? e.g. Studying diffusion models for image generation"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)] resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
