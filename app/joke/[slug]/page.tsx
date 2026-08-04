import { permanentRedirect, notFound } from "next/navigation";

export const revalidate = 86400;

interface Joke {
  id: string;
  slug: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

 type JokeWithRedirect = Joke| { redirect: string };
async function getJoke(slug: string): Promise<JokeWithRedirect | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/joke/${slug}`,
    {
      next: {
        revalidate: 86400,
      },
      redirect: "manual",
    }
  );

  if(res.status===301){
    const location = res.headers.get('Location');
    if (location) {
      return { redirect: location };
    }
  }
  if (res.status === 404) return null;

  if (!res.ok) {
    return null;
  }

  const json = await res.json();

  return json.data as Joke;
}


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JokePage({ params }: PageProps) {
  const { slug } = await params;

  const result = await getJoke(slug);
  if (!result) notFound();

  // Type guard: if it has a `redirect` property, it's a redirect
  if ("redirect" in result) {
    
    permanentRedirect(result.redirect);
    // Next.js will throw internally, so no need to return, but we can add it for clarity
    return null; // this line is never reached, but satisfies TypeScript
  }

  // From here on, TypeScript knows `result` is of type `Joke`
  const joke = result;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <article className="max-w-xl w-full rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-bold">{joke.title}</h1>
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
          {joke.content}
        </p>
        <div className="mt-6 text-sm text-zinc-500">Slug: {joke.slug}</div>
      </article>
    </div>
  );
}