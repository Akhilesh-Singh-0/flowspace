"use client";

import type { ReactNode } from "react";
import {
  Calendar,
  ChevronDown,
  PanelRightClose,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  STATUSES,
  StatusDot,
  type StatusKey,
} from "@/components/landing/demo-parts";
import { typing, useScript, type Frame } from "@/components/landing/use-script";

const PEOPLE = ["Unassigned", "Maya Chen", "Jon Park", "Sam Ortiz"];
const STATUS_ORDER = Object.keys(STATUSES) as StatusKey[];
const COMMENT = "Reproduced on iOS 17. The fix is in review.";

type CardState = {
  open: "assignee" | "status" | null;
  highlight: number;
  focus: "assignee" | "status" | "comment" | null;
  assignee: string;
  status: StatusKey;
  draft: string;
  pressed: boolean;
  comments: { name: string; text: string }[];
};

const initial: CardState = {
  open: null,
  highlight: 0,
  focus: null,
  assignee: "Unassigned",
  status: "BACKLOG",
  draft: "",
  pressed: false,
  comments: [],
};

const frames: Frame<CardState>[] = [
  [1400, { focus: "assignee", open: "assignee", highlight: 0 }],
  [650, { highlight: 1 }],
  [550, { assignee: "Maya Chen", open: null, focus: null }],
  [900, { focus: "status", open: "status", highlight: 0 }],
  [600, { highlight: 1 }],
  [550, { status: "IN_PROGRESS", open: null, focus: null }],
  [900, { focus: "comment" }],
  ...typing<CardState>(COMMENT, 42, (t) => ({ draft: t })),
  [500, { pressed: true }],
  [
    220,
    {
      pressed: false,
      draft: "",
      focus: null,
      comments: [{ name: "Maya Chen", text: COMMENT }],
    },
  ],
  [1100, { focus: "status", open: "status", highlight: 1 }],
  [550, { highlight: 2 }],
  [550, { status: "IN_REVIEW", open: null, focus: null }],
];

function Prop({
  label,
  focus,
  menu,
  children,
}: {
  label: string;
  focus?: boolean;
  menu?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="lp-prop">
      <span className="lp-prop-label">{label}</span>
      <div className="lp-prop-wrap">
        <div className={`lp-prop-val${focus ? " is-focus" : ""}`}>
          {children}
        </div>
        {menu}
      </div>
    </div>
  );
}

export function TaskDemo() {
  const [ref, s] = useScript(initial, frames);

  return (
    <div
      ref={ref}
      className="lp-win lp-win-plain"
      role="img"
      aria-label="Animated demo of a FlowSpace task: it is assigned to a teammate, moved to In Progress, commented on and moved to In Review"
    >
      <div className="lp-card" aria-hidden="true">
        <div className="lp-card-bar">
          <PanelRightClose size={16} />
          <span className="lp-card-actions">
            <Pencil size={15} />
            <Trash2 size={15} />
          </span>
        </div>

        <div className="lp-card-body">
          <p className="lp-card-title">Add pull-to-refresh to the feed</p>

          <Prop
            label="Status"
            focus={s.focus === "status"}
            menu={
              s.open === "status" && (
                <div className="lp-menu">
                  {STATUS_ORDER.map((key, i) => (
                    <div
                      key={key}
                      className={`lp-menu-item${
                        i === s.highlight ? " is-hl" : ""
                      }`}
                    >
                      <StatusDot status={key} />
                      {STATUSES[key].label}
                    </div>
                  ))}
                </div>
              )
            }
          >
            <StatusDot status={s.status} />
            {STATUSES[s.status].label}
            <ChevronDown size={16} />
          </Prop>

          <Prop label="Priority">
            High
            <ChevronDown size={16} />
          </Prop>

          <Prop label="Due date">
            11/20/2026
            <Calendar size={16} />
          </Prop>

          <Prop
            label="Assignee"
            focus={s.focus === "assignee"}
            menu={
              s.open === "assignee" && (
                <div className="lp-menu">
                  {PEOPLE.map((name, i) => (
                    <div
                      key={name}
                      className={`lp-menu-item${
                        i === s.highlight ? " is-hl" : ""
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )
            }
          >
            {s.assignee === "Unassigned" ? (
              <span className="lp-soft">Unassigned</span>
            ) : (
              s.assignee
            )}
            <ChevronDown size={16} />
          </Prop>

          <div className="lp-card-section">
            <p className="lp-card-label">Comments</p>

            {s.comments.length === 0 && (
              <p className="lp-cmt-empty">
                No comments yet. Be the first to comment.
              </p>
            )}

            {s.comments.map((comment, i) => (
              <div className="lp-cmt is-new" key={i}>
                <Avatar name={comment.name} />
                <div>
                  <p className="lp-cmt-name">{comment.name}</p>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}

            <div
              className={`lp-fld-box lp-area${
                s.focus === "comment" ? " is-focus" : ""
              }`}
            >
              {s.draft ? (
                <span>{s.draft}</span>
              ) : (
                <span className="lp-fld-ph">
                  Write a comment... (Cmd+Enter to submit)
                </span>
              )}
              {s.focus === "comment" && <span className="lp-caret" />}
            </div>

            <div className="lp-cmt-send">
              <span
                className={`lp-app-btn${s.pressed ? " is-pressed" : ""}${
                  s.draft ? "" : " is-disabled"
                }`}
              >
                Comment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
