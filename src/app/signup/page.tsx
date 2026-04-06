"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-[var(--muted)] mt-1 text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-[var(--accent)] hover:underline">Sign in</Link>
          </p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Name <span className="font-normal">(optional)</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Password <span className="font-normal">(min 8 characters)</span></label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full py-2.5 bg-transparent border-0 border-b border-[var(--divide)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
