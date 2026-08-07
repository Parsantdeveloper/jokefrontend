import Link from "next/link";
import { getAllJokes } from "@/lib/jokes-api";

export async function generateStaticParams() {
  const allJokes = await getAllJokes();
  return allJokes.map((joke) => ({ slug: joke.slug }));
}

export const revalidate = 86400;

export default async function JokesPage() {
  const jokes = await getAllJokes();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold">Jokes</h1>

        {jokes.length === 0 ? (
          <p className="text-zinc-400">No jokes yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jokes.map((joke) => (
              <Link
                key={joke.id}
                href={`/jokes/${joke.slug}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-600"
              >
                <h2 className="text-base font-semibold text-white">
                  {joke.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {joke.content}
                </p>
                {joke.author && (
                  <p className="mt-2 text-[11px] text-zinc-500">
                    by {joke.author.email}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}