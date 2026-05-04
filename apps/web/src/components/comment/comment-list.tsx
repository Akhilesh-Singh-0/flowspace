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
      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
        {initials}
      </div>

      <div className="flex-1 min-w-0 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 transition-colors duration-150 group-hover:border-border/80">

        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {comment.author.name ?? 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground/50">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={() => deleteComment(comment.id)}
              title="Delete comment"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-foreground/80 leading-relaxed break-words">
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
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 h-16 bg-secondary rounded-lg" />
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
    <div className="space-y-3">
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