'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  Clipboard,
  Edit3,
  ExternalLink,
  Link2,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createRedirect,
  getRedirects,
  updateRedirect,
} from '@/lib/redirects-api'
import {Redirect } from '@/types/types'
function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function RedirectsView() {
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Redirect | null>(null)
  const [fromPath, setFromPath] = useState('')
  const [toPath, setToPath] = useState('')
  const [active, setActive] = useState(true)
  const [type, setType] = useState('TEMPORARY_307')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState('')

  const loadRedirects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getRedirects({ page: 1, limit: 50 })
      setRedirects(result.data.redirects)
      setTotal(result.data.meta.total)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Unable to load redirects',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadRedirects()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [loadRedirects])

  const filtered = useMemo(
    () =>
      redirects.filter((redirect) =>
        `${redirect.from_path} ${redirect.to_path}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [redirects, query],
  )

  function openCreate() {
    setEditing(null)
    setFromPath('')
    setToPath('')
    setActive(true)
    setType('TEMPORARY_307')
    setDialogOpen(true)
  }

  function openEdit(redirect: Redirect) {
    setEditing(redirect)
    setFromPath(redirect.from_path)
    setToPath(redirect.to_path)
    setActive(redirect.active)
    setType(redirect.type)
    setDialogOpen(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateRedirect(editing.id, {
          to_path: toPath.trim(),
          active,
          type,
        })
      } else {
        await createRedirect({
          from_path: fromPath.trim(),
          to_path: toPath.trim(),
        })
      }
      setDialogOpen(false)
      toast.add({
        title: editing ? 'Redirect updated' : 'Redirect created',
        description: editing
          ? 'The redirect rule has been modified.'
          : 'A new redirect is now active.',
      })
      await loadRedirects()
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Unable to save redirect'
      toast.add({
        title: 'Error',
        description: message,
      })
    } finally {
      setSaving(false)
    }
  }

  async function copyPath(path: string) {
    await navigator.clipboard.writeText(path)
    setCopied(path)
    toast.add({
      title: 'Path copied',
      description: path,
    })
    window.setTimeout(() => setCopied(''), 1600)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total redirects"
          value={loading ? '—' : total}
          detail="Across all routes"
          icon={Link2}
        />
        <MetricCard
          label="Redirect type"
          value="307"
          detail="Temporary by default"
          icon={ExternalLink}
        />
      </div>

      <Card>
        <CardHeader className="gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Redirect rules</CardTitle>
            <CardDescription>
              Manage route forwarding and keep links healthy.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" /> New redirect
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {error ? (
            <div className="p-4">
              <Alert variant="destructive">
                <TriangleAlert data-icon="inline-start" />
                <AlertTitle>Could not load redirects</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : loading ? (
            <LoadingRows />
          ) : filtered.length === 0 ? (
            <Empty className="min-h-72 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Link2 />
                </EmptyMedia>
                <EmptyTitle>
                  {query ? 'No matching redirects' : 'No redirects yet'}
                </EmptyTitle>
                <EmptyDescription>
                  {query
                    ? 'Try a different path.'
                    : 'Create your first route rule to get started.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From path</TableHead>
                  <TableHead>To path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-mono text-xs">
                      <PathCell
                        path={redirect.from_path}
                        copied={copied}
                        onCopy={copyPath}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <PathCell
                        path={redirect.to_path}
                        copied={copied}
                        onCopy={copyPath}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {redirect.type.replace('TEMPORARY_', '').replace('PERMANENT_', '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={redirect.active ? 'default' : 'secondary'}>
                        {redirect.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(redirect.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(redirect)}
                        aria-label={`Edit ${redirect.from_path}`}
                      >
                        <Edit3 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit redirect' : 'Create redirect'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update destination, status, or redirect type.'
                : 'Add a temporary route rule for your application.'}
            </DialogDescription>
          </DialogHeader>

          <form
            id="redirect-form"
            onSubmit={submit}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="from-path">From path</Label>
              <Input
                id="from-path"
                required
                disabled={Boolean(editing)}
                value={fromPath}
                onChange={(event) => setFromPath(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="to-path">To path</Label>
              <Input
                id="to-path"
                required
                value={toPath}
                onChange={(event) => setToPath(event.target.value)}
              />
            </div>
            {editing && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="redirect-type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value!)}
                  >
                    <SelectTrigger id="redirect-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="w-48">
                      <SelectItem value="TEMPORARY_307">
                        Temporary (307)
                      </SelectItem>
                      <SelectItem value="PERMANENT_308">
                        Permanent (308)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="redirect-active">Active</Label>
                  <Switch
                    id="redirect-active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                </div>
              </>
            )}
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="redirect-form" disabled={saving}>
              {saving
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Create redirect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PathCell({
  path,
  copied,
  onCopy,
}: {
  path: string
  copied: string
  onCopy: (path: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate">{path}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => void onCopy(path)}
        aria-label={`Copy ${path}`}
      >
        {copied === path ? <Check /> : <Clipboard />}
      </Button>
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string | number
  detail: string
  icon: React.ComponentType
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{detail}</span>
        </div>
        <div className="rounded-md border border-border bg-muted/50 p-2">
          <Icon />
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}