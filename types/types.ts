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


  export type Redirect = {
  id: string;
  from_path: string;
  to_path: string;
  type: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RedirectsMeta = {
  page: number;
  limit: number;
  total: number;
};

export type RedirectsResponse = {
  status: number;
  message: string;
  data: {
    redirects: Redirect[];
    meta: RedirectsMeta;
  };
};

export type RedirectResponse = {
  status: number;
  message: string;
  data: Redirect;
};

export type CreateRedirectInput = {
  from_path: string;
  to_path: string;
};

export type UpdateRedirectInput = {
  to_path: string;
  active: boolean;
  type: string;
};