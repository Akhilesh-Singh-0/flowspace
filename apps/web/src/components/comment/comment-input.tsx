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
        className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-medium text-foreground outline-none transition-colors placeholder:text-text-placeholder focus:border-ring focus:ring-1 focus:ring-ring"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !value.trim()}
        >
          {isPending ? 'Posting...' : 'Comment'}
        </Button>
      </div>
    </div>
  )
}