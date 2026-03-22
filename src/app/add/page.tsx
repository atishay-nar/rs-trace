"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddPaper() {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
          const res = await fetch("/api/papers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: input.trim()}),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Something went wrong");
            return;
          }
          router.push("/");
        } catch {
          setError("Network error. Try again.");
        } finally {
          setLoading(false);
        }
      }
    
      return (
        <div>
          <p><Link href="/">← Back</Link></p>
          <h1>Add a paper</h1>
          <p>Paste a DOI or arXiv ID. We fetch the details for you.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="e.g. 10.1234/example or 2301.12345"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Fetching..." : "Add paper"}
            </button>
          </form>
        </div>
      );

}