import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllJokes, getJokeBySlug } from "@/lib/jokes-api";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const jokes = await getAllJokes();
  return jokes.map((joke) => ({ slug: joke.slug }));
}

export default async function JokePage({ params }: PageProps) {
  const { slug } = await params;

  const joke = await getJokeBySlug(slug);

  if (!joke) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mx-auto max-w-xl py-10">
        <Link
          href="/jokes"
          className="mb-6 inline-block text-sm text-zinc-400 hover:text-white"
        >
          ← Back to jokes
        </Link>

        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="mb-4 text-2xl font-bold text-white">
            {joke.title}
          </h1>
          <p className="whitespace-pre-wrap text-zinc-300">
            {joke.content}
          </p>
          <div className="mt-6 text-sm text-zinc-500">
            Slug: {joke.slug}
          </div>
        </article>
      </div>
    </div>
  );
}