"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type Joke = {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

function Spinner() {
  return (
    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

type JokeItemProps = {
  joke: Joke;
  onSave: (slug: string, payload: { title?: string; content?: string }) => Promise<void>;
  onDelete: (slug: string) => Promise<void>;
};

// Isolated so editing/typing only re-renders this row, not the whole list.
const JokeItem = memo(function JokeItem({ joke, onSave, onDelete }: JokeItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(joke.title);
  const [content, setContent] = useState(joke.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startEdit = () => {
    setTitle(joke.title);
    setContent(joke.content);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (isSaving) return;
    setTitle(joke.title);
    setContent(joke.content);
    setIsEditing(false);
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) return;

    const payload: { title?: string; content?: string } = {};
    if (title !== joke.title) payload.title = title;
    if (content !== joke.content) payload.content = content;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(joke.slug, payload);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update joke");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Are you sure you want to delete this joke?")) return;
    setIsDeleting(true);
    try {
      await onDelete(joke.slug);
    } catch (err) {
      alert("Failed to delete joke");
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <li className="border rounded-lg p-4 bg-white dark:bg-zinc-900">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-60"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSaving}
            rows={2}
            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-60"
            required
          />
          <div className="flex gap-2 items-center">
            <button
              onClick={save}
              disabled={isSaving}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Spinner />}
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={isSaving}
              className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 rounded hover:bg-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="border rounded-lg p-4 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <Link
        href={`/joke/${joke.slug}`}
        className="flex-1"
        onClick={(e) => {
          e.preventDefault();
          router.push(`/joke/${joke.slug}`);
        }}
      >
        <h3 className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
          {joke.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {joke.content}
        </p>
        <p className="text-xs text-zinc-400 mt-1">Slug: {joke.slug}</p>
      </Link>
      <div className="flex gap-2 self-end sm:self-center">
        <button
          onClick={startEdit}
          disabled={isDeleting}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={remove}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isDeleting && <Spinner />}
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </li>
  );
});

export default JokeItem;