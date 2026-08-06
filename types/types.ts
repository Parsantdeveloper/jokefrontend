export interface Author {
  id: string;
  email: string;
}

export interface Joke {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: Author; // only present on the list endpoint
}

export type RedirectLookupResult =
  | { redirect: true; to: string; status: 307 | 308 }
  | { redirect: false };