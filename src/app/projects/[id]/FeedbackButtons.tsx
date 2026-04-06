"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeedbackButtons({
  projectId,
  paperId,
  current,
}: {
  projectId: string;
  paperId: string;
  current: boolean | null;
}) {
  const [value, setValue] = useState<boolean | null>(current);
  const router = useRouter();

  async function submit(feedback: boolean) {
    const next = value === feedback ? null : feedback;
    setValue(next);
    await fetch(`/api/projects/${projectId}/papers/${paperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-1 shrink-0">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); submit(true); }}
        className={`text-sm px-2 py-0.5 rounded transition-colors ${
          value === true
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
        title="Helpful"
      >
        👍
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); submit(false); }}
        className={`text-sm px-2 py-0.5 rounded transition-colors ${
          value === false
            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
        title="Not helpful"
      >
        👎
      </button>
    </div>
  );
}
