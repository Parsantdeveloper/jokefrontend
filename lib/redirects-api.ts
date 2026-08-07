import { api } from "./axiosInstance";
import {Redirect,RedirectsMeta,RedirectsResponse,RedirectResponse,CreateRedirectInput,UpdateRedirectInput } from "../types/types";



// ─── All requests go through axios ──────────────────────────────────────────

export async function getRedirects(params?: { page?: number; limit?: number }) {
  const response = await api.get<RedirectsResponse>('/redirect', { params });
  return response.data;
}

export async function getRedirect(id: string) {
  const response = await api.get<RedirectResponse>(`/redirect/${encodeURIComponent(id)}`);
  return response.data;
}

export async function createRedirect(input: CreateRedirectInput) {
  const response = await api.post<RedirectResponse>('/redirect', input);
  return response.data;
}

export async function updateRedirect(id: string, input: UpdateRedirectInput) {
  const response = await api.put<RedirectResponse>(`/redirect/${encodeURIComponent(id)}`, input);
  return response.data;
}

export async function deleteRedirect(id: string) {
  await api.delete(`/redirect/${encodeURIComponent(id)}`);
}