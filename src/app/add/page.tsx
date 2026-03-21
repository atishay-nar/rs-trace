"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPaper() {
    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState("");
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
                body: JSON.stringify({ title, authors, source: "arxiv" }),
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
            <h1>Add Paper</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Authors"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add paper"}
                </button>
            </form>
        </div>
    );
}
