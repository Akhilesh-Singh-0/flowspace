'use client'

import { useComments, useDeleteComment } from '@/hooks/use-comments'
import { useMembers } from '@/hooks/use-members'
import { useUser } from '@clerk/nextjs'
import type { Comment } from '@/types'
import { Trash2 } from 'lucide-react'

function CommentItem({
  comment,
  workspaceId,
  taskId,
  currentDbUserId,
}: {
  comment: Comment
  workspaceId: string
  taskId: string
  currentDbUserId: string | null
}) {
  const { mutate: deleteComment } = useDeleteComment(workspaceId, taskId)
  const initials = comment.author.name
    ? comment.author.name.slice(0, 2).toUpperCase()
    : '??'
  const isOwner = !!currentDbUserId && currentDbUserId === comment.author.id

  return (
    <div className="group flex gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-small font-semibold text-foreground">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-medium font-semibold text-foreground">
              {comment.author.name ?? 'Unknown'}
            </span>
            <span className="text-small text-text-secondary">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={() => deleteComment(comment.id)}
              aria-label="Delete comment"
              title="Delete comment"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-small text-text-secondary opacity-0 transition-[color,opacity] hover:text-priority-urgent focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          )}
        </div>

        <p className="whitespace-pre-wrap break-words text-medium text-foreground">
          {comment.body}
        </p>
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
  const { data: members } = useMembers(workspaceId)
  const { user } = useUser()

  const currentEmail = user?.primaryEmailAddress?.emailAddress
  const currentName = user?.fullName

  const currentDbUserId =
    members?.find((m) => m.user.email !== '' && m.user.email === currentEmail)?.user.id ??
    members?.find((m) =>
      m.user.name != null &&
      currentName?.toLowerCase().replace(/\s/g, '').includes(
        m.user.name.toLowerCase().replace(/\s/g, '')
      )
    )?.user.id ??
    null

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex animate-pulse gap-3">
            <div className="h-6 w-6 shrink-0 rounded-full bg-surface-hover" />
            <div className="h-12 flex-1 rounded-md bg-surface-hover" />
          </div>
        ))}
      </div>
    )
  }

  if (!comments || comments.length === 0) {
    return (
      <p className="py-2 text-center text-medium text-text-secondary">
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
          currentDbUserId={currentDbUserId}
        />
      ))}
    </div>
  )
}