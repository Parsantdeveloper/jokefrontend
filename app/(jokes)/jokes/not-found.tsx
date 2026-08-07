import Link from "next/link";

export default function JokeNotFound() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mx-auto max-w-xl py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Joke not found</h1>
        <p className="text-zinc-400 mb-6">
          We couldn’t find that joke. It may have been deleted or the URL is wrong.
        </p>
        <Link
          href="/jokes"
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          ← Back to all jokes
        </Link>
      </div>
    </div>
  );
}