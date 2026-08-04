"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axiosInstance"; 

type Joke = {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for new joke
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Inline editing state
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Fetch jokes on mount
  const fetchJokes = async () => {
  try {
    setLoading(true);
    const { data } = await api.get("/joke");
    setJokes(data.data);
  } catch (err) {
    setError("Failed to load jokes");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let ignore = false;

  (async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/joke");
      if (!ignore) setJokes(data.data);
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
  // Create joke
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await api.post("/joke", { title, content });
      setTitle("");
      setContent("");
      await fetchJokes(); // refresh list
    } catch (err) {
      alert("Failed to create joke");
      console.error(err);
    }
  };

  // Start editing
  const startEdit = (joke: Joke) => {
    setEditingSlug(joke.slug);
    setEditTitle(joke.title);
    setEditContent(joke.content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSlug(null);
    setEditTitle("");
    setEditContent("");
  };

  // Save edit
  const handleUpdate = async (slug: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      await api.put(`/joke/${slug}`, {
        title: editTitle,
        content: editContent,
      });
      setEditingSlug(null);
      await fetchJokes();
    } catch (err) {
      alert("Failed to update joke");
      console.error(err);
    }
  };

  // Delete joke
  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this joke?")) return;
    try {
      await api.delete(`/joke/${slug}`);
      await fetchJokes();
    } catch (err) {
      alert("Failed to delete joke");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Joke Admin Dashboard</h1>

      {/* Create new joke form */}
      <form onSubmit={handleCreate} className="mb-8 p-4 border rounded-lg bg-white dark:bg-zinc-900">
        <h2 className="text-lg font-semibold mb-3">Add New Joke</h2>
        <input
          type="text"
          placeholder="Joke title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
        <textarea
          placeholder="Joke content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-2 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
          rows={3}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Joke
        </button>
      </form>

      {/* Error & loading states */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-zinc-500">Loading jokes...</p>}

      {/* Jokes list */}
      {!loading && jokes.length === 0 && (
        <p className="text-zinc-500">No jokes yet. Add one above!</p>
      )}

      <ul className="space-y-4">
        {jokes.map((joke) => (
          <li
            key={joke.id}
            className="border rounded-lg p-4 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            {editingSlug === joke.slug ? (
              /* Edit mode */
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                  required
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                  rows={2}
                  required
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(joke.slug)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 rounded hover:bg-zinc-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <>
                <div className="flex-1">
                  <h3
                    className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => router.push(`/joke/${joke.slug}`)}
                  >
                    {joke.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {joke.content}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Slug: {joke.slug}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <button
                    onClick={() => startEdit(joke)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(joke.slug)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}