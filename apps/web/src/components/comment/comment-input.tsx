'use client'

import { useState } from 'react'
import { useCreateComment } from '@/hooks/use-comments'
import { Button } from '@/components/ui/button'

export function CommentInput({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}) {
  const [value, setValue] = useState('')
  const { mutate, isPending } = useCreateComment(workspaceId, taskId)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    mutate(trimmed, {
      onSuccess: () => setValue(''),
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment... (Cmd+Enter to submit)"
        rows={3}
        className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !value.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isPending ? 'Posting...' : 'Comment'}
        </Button>
      </div>
    </div>
  )
}