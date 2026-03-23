"use client";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  async function handleDelete() {
    if (!confirm("Delete this project? Papers will be kept but unassigned from it.")) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/";
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-red-500 hover:border-red-400 hover:text-red-600 transition-colors"
    >
      Delete project
    </button>
  );
}
