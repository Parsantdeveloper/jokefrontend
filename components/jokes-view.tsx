'use client'

import { useCallback, useEffect, useState } from 'react'
import { Edit3, Laugh, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { createJoke, deleteJoke, getAllJokes, updateJoke,  } from '@/lib/jokes-api'
import type { Joke } from '@/types/types'

export function JokesView() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Joke | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await getAllJokes(); setJokes(result) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load jokes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load() })
    return () => window.cancelAnimationFrame(frame)
  }, [load])

  function openCreate() { setEditing(null); setTitle(''); setContent(''); setOpen(true) }
  function openEdit(joke: Joke) { setEditing(joke); setTitle(joke.title); setContent(joke.content); setOpen(true) }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true)
    try {
      if (editing) await updateJoke(editing.id, { title: title.trim(), content: content.trim() })
      else await createJoke({ title: title.trim(), content: content.trim() })
      setOpen(false); toast.success(editing ? 'Joke updated' : 'Joke created'); await load()
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Unable to save joke') }
    finally { setSaving(false) }
  }

  async function remove(joke: Joke) {
    if (!window.confirm(`Delete “${joke.title}”?`)) return
    try { await deleteJoke(joke.id); toast.success('Joke deleted'); await load() }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Unable to delete joke') }
  }

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-semibold tracking-tight">Jokes</h2><p className="text-muted-foreground">Keep your content library fresh and ready to serve.</p></div><Button onClick={openCreate}><Plus data-icon="inline-start" /> Add joke</Button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit joke' : 'Add a joke'}</DialogTitle><DialogDescription>Give your joke a title and the content readers will see.</DialogDescription></DialogHeader><form id="joke-form" onSubmit={submit} className="flex flex-col gap-4 py-2"><div className="flex flex-col gap-2"><Label htmlFor="joke-title">Title</Label><Input id="joke-title" required value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="joke-content">Content</Label><Textarea id="joke-content" required value={content} onChange={(event) => setContent(event.target.value)} /></div></form><DialogFooter><Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="joke-form" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Save joke'}</Button></DialogFooter></DialogContent></Dialog>
    {error ? <Alert variant="destructive"><TriangleAlert data-icon="inline-start" /><AlertTitle>Could not load jokes</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : loading ? <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-36" />)}</div> : jokes.length === 0 ? <Card><CardContent><Empty className="min-h-72 border-0"><EmptyHeader><EmptyMedia variant="icon"><Laugh /></EmptyMedia><EmptyTitle>No jokes yet</EmptyTitle><EmptyDescription>Add a joke to start building your library.</EmptyDescription></EmptyHeader></Empty></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2">{jokes.map((joke) => <Card key={joke.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg">{joke.title}</CardTitle><CardDescription>{joke.slug ? `/${joke.slug}` : 'Joke'}</CardDescription></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(joke)} aria-label={`Edit ${joke.title}`}><Edit3 /></Button><Button variant="ghost" size="icon" onClick={() => void remove(joke)} aria-label={`Delete ${joke.title}`}><Trash2 /></Button></div></div></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">{joke.content}</p></CardContent></Card>)}</div>}
  </div>
}
