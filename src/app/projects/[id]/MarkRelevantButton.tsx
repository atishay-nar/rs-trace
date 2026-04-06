"use client";

import { useRouter } from "next/navigation";

export function MarkRelevantButton({
  projectId,
  paperId,
}: {
  projectId: string;
  paperId: string;
}) {
  const router = useRouter();

  async function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/projects/${projectId}/papers/${paperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: true }),
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="text-sm text-[var(--accent)] hover:underline shrink-0"
    >
      Mark relevant
    </button>
  );
}
