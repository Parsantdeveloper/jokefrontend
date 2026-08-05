"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { api } from "@/lib/axiosInstance";
import JokeItem, { Joke } from "@/components/JokeItem";

function Spinner() {
  return (
    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

export default function AdminPage() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/joke");
        if (!ignore) setJokes(data?.data ?? []);
      } catch (err) {
        if (!ignore) setError("Failed to load jokes");
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !content.trim()) return;

      setIsCreating(true);
      try {
        const { data } = await api.post("/joke", { title, content });
        const created: Joke | undefined = data?.data;

        setTitle("");
        setContent("");

        if (created?.id) {
          setJokes((prev) => [created, ...prev]);
        } else {
          const { data: fresh } = await api.get("/joke");
          setJokes(fresh?.data ?? []);
        }
      } catch (err) {
        alert("Failed to create joke");
        console.error(err);
      } finally {
        setIsCreating(false);
      }
    },
    [title, content]
  );

  const handleUpdate = useCallback(
    async (slug: string, payload: { title?: string; content?: string }) => {
      const { data } = await api.put(`/joke/${slug}`, payload);
      const updated: Joke | undefined = data?.data;

      if (updated?.id) {
        setJokes((prev) => prev.map((j) => (j.slug === slug ? updated : j)));
      } else {
        const { data: fresh } = await api.get("/joke");
        setJokes(fresh?.data ?? []);
      }
    },
    []
  );

  const handleDelete = useCallback(async (slug: string) => {
    await api.delete(`/joke/${slug}`);
    setJokes((prev) => prev.filter((j) => j.slug !== slug));
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Joke Admin Dashboard</h1>

      {/* Create new joke form */}
      <form
        onSubmit={handleCreate}
        className="mb-8 p-4 border rounded-lg bg-white dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold mb-3">Add New Joke</h2>
        <input
          type="text"
          placeholder="Joke title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
          className="w-full mb-2 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-60"
          required
        />
        <textarea
          placeholder="Joke content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isCreating}
          rows={3}
          className="w-full mb-2 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-60"
          required
        />
        <button
          type="submit"
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCreating && <Spinner />}
          {isCreating ? "Adding..." : "Add Joke"}
        </button>
      </form>

      {/* Error & loading states */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-zinc-500">Loading jokes...</p>}
      {!loading && jokes.length === 0 && (
        <p className="text-zinc-500">No jokes yet. Add one above!</p>
      )}

      <ul className="space-y-4">
        {jokes.map((joke) => (
          <JokeItem key={joke.id} joke={joke} onSave={handleUpdate} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}