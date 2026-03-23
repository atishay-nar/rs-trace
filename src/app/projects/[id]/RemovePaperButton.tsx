"use client";

import { useRouter } from "next/navigation";

export function RemovePaperButton({
  projectId,
  paperId,
}: {
  projectId: string;
  paperId: string;
}) {
  const router = useRouter();

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this paper from the project?")) return;
    const res = await fetch(`/api/projects/${projectId}/papers/${paperId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      className="text-sm text-red-500 hover:text-red-600 shrink-0"
    >
      Remove
    </button>
  );
}
