'use client'

import { useComments, useDeleteComment } from '@/hooks/use-comments'
import { useAuth } from '@clerk/nextjs'
import type { Comment } from '@/types'

function CommentItem({
  comment,
  workspaceId,
  taskId,
  currentUserId,
}: {
  comment: Comment
  workspaceId: string
  taskId: string
  currentUserId: string | null | undefined
}) {
  const { mutate: deleteComment } = useDeleteComment(workspaceId, taskId)

  const initials = comment.author.name
    ? comment.author.name.slice(0, 2).toUpperCase()
    : '??'

  const isOwner = currentUserId === comment.authorId

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground">
            {comment.author.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 break-words">
          {comment.body}
        </p>
        {isOwner && (
          <button
            onClick={() => deleteComment(comment.id)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export function CommentList({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}) {
  const { data: comments, isLoading } = useComments(workspaceId, taskId)
  const { userId } = useAuth()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 bg-secondary rounded" />
              <div className="h-3 w-full bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!comments || comments.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No comments yet. Be the first to comment.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          workspaceId={workspaceId}
          taskId={taskId}
          currentUserId={userId}
        />
      ))}
    </div>
  )
}