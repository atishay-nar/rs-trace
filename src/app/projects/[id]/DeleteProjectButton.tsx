"use client";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  async function handleDelete() {
    if (!confirm("Delete this project? Papers will be kept but unassigned from it.")) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/projects";
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm text-red-500 hover:text-red-600"
    >
      Delete project
    </button>
  );
}
