import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white"
        >
          JokeAPI <span className="text-2xl font-black  text-zinc-400">.</span>
        </Link>
        <Link
          href="/admin"
          className="text-sm font-medium  transition-colors text-zinc-400 hover:text-white"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}