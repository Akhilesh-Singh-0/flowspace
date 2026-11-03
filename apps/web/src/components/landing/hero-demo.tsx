"use client";

import type { ReactNode } from "react";
import {
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  List,
  Plus,
  Users,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Bars, StatusDot } from "@/components/landing/demo-parts";
import { typing, useScript, type Frame } from "@/components/landing/use-script";

type HeroState = {
  scene: 0 | 1 | 2;
  dialog: "workspace" | "project" | "task" | null;
  pressed: string | null;
  focus: string | null;
  wsName: string;
  wsSlug: string;
  prjTitle: string;
  prjDesc: string;
  taskTitle: string;
  taskPriority: "MEDIUM" | "HIGH";
  hasWorkspace: boolean;
  hasProject: boolean;
  hasTask: boolean;
};

const initial: HeroState = {
  scene: 0,
  dialog: null,
  pressed: null,
  focus: null,
  wsName: "",
  wsSlug: "",
  prjTitle: "",
  prjDesc: "",
  taskTitle: "",
  taskPriority: "MEDIUM",
  hasWorkspace: false,
  hasProject: false,
  hasTask: false,
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const frames: Frame<HeroState>[] = [
  [1200, { pressed: "ws" }],
  [220, { pressed: null, dialog: "workspace", focus: "wsName" }],
  [500, {}],
  ...typing<HeroState>("Northwind", 85, (t) => ({
    wsName: t,
    wsSlug: slug(t),
  })),
  [650, { pressed: "ws-create" }],
  [220, { pressed: null, dialog: null, focus: null, hasWorkspace: true }],
  [1400, { pressed: "row-ws" }],
  [220, { pressed: null, scene: 1 }],
  [900, { pressed: "prj" }],
  [220, { pressed: null, dialog: "project", focus: "prjTitle" }],
  [500, {}],
  ...typing<HeroState>("Mobile app", 80, (t) => ({ prjTitle: t })),
  [250, { focus: "prjDesc" }],
  ...typing<HeroState>("Ship the iOS and Android release.", 38, (t) => ({
    prjDesc: t,
  })),
  [650, { pressed: "prj-create" }],
  [220, { pressed: null, dialog: null, focus: null, hasProject: true }],
  [1400, { pressed: "row-prj" }],
  [220, { pressed: null, scene: 2 }],
  [900, { pressed: "task" }],
  [220, { pressed: null, dialog: "task", focus: "taskTitle" }],
  [500, {}],
  ...typing<HeroState>("Add pull-to-refresh to the feed", 48, (t) => ({
    taskTitle: t,
  })),
  [450, { focus: "taskPriority" }],
  [700, { taskPriority: "HIGH" }],
  [700, { pressed: "task-create" }],
  [220, { pressed: null, dialog: null, focus: null, hasTask: true }],
];

function Head({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="lp-app-head">
      <div>
        <p className="lp-app-title">{title}</p>
        <p className="lp-app-sub">{text}</p>
      </div>
      {children}
    </div>
  );
}

function Btn({
  children,
  pressed,
  ghost,
}: {
  children: ReactNode;
  pressed?: boolean;
  ghost?: boolean;
}) {
  return (
    <span
      className={`lp-app-btn${ghost ? " lp-app-btn-ghost" : ""}${
        pressed ? " is-pressed" : ""
      }`}
    >
      {children}
    </span>
  );
}

function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="lp-app-empty">
      <p className="lp-app-empty-title">{title}</p>
      <p className="lp-app-empty-text">{text}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  focus,
  tall,
  select,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  focus?: boolean;
  tall?: boolean;
  select?: boolean;
}) {
  return (
    <div className="lp-fld">
      <span className="lp-fld-label">{label}</span>
      <div
        className={`lp-fld-box${tall ? " is-tall" : ""}${
          focus ? " is-focus" : ""
        }`}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="lp-fld-ph">{placeholder}</span>
        )}
        {focus && !select && <span className="lp-caret" />}
        {select && <ChevronDown className="lp-fld-chev" size={16} />}
      </div>
    </div>
  );
}

export function HeroDemo() {
  const [ref, s] = useScript(initial, frames);
  const pressed = (key: string) => s.pressed === key;

  return (
    <div
      ref={ref}
      className="lp-win"
      role="img"
      aria-label="Animated demo of FlowSpace: a workspace, a project and a task are created one after another"
    >
      <aside className="lp-win-side" aria-hidden="true">
        <div className="lp-win-brand">
          <Logo size={20} />
          FlowSpace
        </div>

        <div className={`lp-win-nav${s.scene === 0 ? " is-active" : ""}`}>
          <LayoutDashboard size={16} />
          Workspaces
        </div>

        {s.scene > 0 && (
          <>
            <div className="lp-win-label">Workspace</div>
            <div className="lp-win-nav is-active">
              <FolderKanban size={16} />
              Projects
            </div>
            <div className="lp-win-nav">
              <Users size={16} />
              Members
            </div>
          </>
        )}
      </aside>

      <div className="lp-win-main" aria-hidden="true">
        {s.scene === 0 && (
          <>
            <Head
              title="Workspaces"
              text="Manage your teams and their projects."
            >
              <Btn pressed={pressed("ws")}>
                <Plus size={16} />
                New workspace
              </Btn>
            </Head>

            {s.hasWorkspace ? (
              <div
                className={`lp-app-row is-new${
                  pressed("row-ws") ? " is-hover" : ""
                }`}
              >
                <span className="lp-app-ico lp-app-ico-letter">
                  {s.wsName.charAt(0).toUpperCase()}
                </span>
                <span className="lp-app-name">{s.wsName}</span>
                <span className="lp-app-slug">/{s.wsSlug}</span>
                <span className="lp-app-end">Owner</span>
              </div>
            ) : (
              <Empty
                title="No workspaces yet"
                text="Create a workspace to start organizing your team's work."
              />
            )}
          </>
        )}

        {s.scene === 1 && (
          <>
            <Head
              title="Projects"
              text="Everything your team is working on, in one place."
            >
              {s.hasProject && (
                <Btn>
                  <Plus size={16} />
                  New project
                </Btn>
              )}
            </Head>

            {s.hasProject ? (
              <div
                className={`lp-app-row lp-app-row-tall is-new${
                  pressed("row-prj") ? " is-hover" : ""
                }`}
              >
                <span className="lp-app-ico">
                  <FolderKanban size={14} />
                </span>
                <div className="lp-app-stack">
                  <span className="lp-app-name">{s.prjTitle}</span>
                  <span className="lp-app-desc">{s.prjDesc}</span>
                </div>
                <span className="lp-app-end">less than a minute ago</span>
              </div>
            ) : (
              <Empty
                title="No projects yet"
                text="Create your first project and start tracking work."
              >
                <Btn pressed={pressed("prj")}>
                  <Plus size={16} />
                  New project
                </Btn>
              </Empty>
            )}
          </>
        )}

        {s.scene === 2 && (
          <>
            <Head title="Tasks" text="All tasks in this project.">
              <div className="lp-app-actions">
                <span className="lp-seg">
                  <span className="is-on">
                    <List size={16} />
                    List
                  </span>
                  <span>
                    <LayoutDashboard size={16} />
                    Board
                  </span>
                </span>
                <Btn>
                  <Plus size={16} />
                  New task
                </Btn>
              </div>
            </Head>

            {s.hasTask ? (
              <>
                <div className="lp-trow lp-thead">
                  <span>Priority</span>
                  <span>Task</span>
                  <span>Assignee</span>
                  <span>Status</span>
                </div>
                <div className="lp-trow is-new">
                  <span className="lp-prio">
                    <Bars level={s.taskPriority === "HIGH" ? 3 : 2} />
                    {s.taskPriority === "HIGH" ? "High" : "Medium"}
                  </span>
                  <span className="lp-trow-title">{s.taskTitle}</span>
                  <span className="lp-soft">Unassigned</span>
                  <span className="lp-st">
                    <StatusDot status="BACKLOG" />
                    Backlog
                  </span>
                </div>
              </>
            ) : (
              <Empty
                title="No tasks yet"
                text="Create your first task to get started."
              >
                <Btn pressed={pressed("task")}>
                  <Plus size={16} />
                  New task
                </Btn>
              </Empty>
            )}
          </>
        )}

        {s.dialog && (
          <div className="lp-dlg-back">
            <div className="lp-dlg">
              {s.dialog === "workspace" && (
                <>
                  <p className="lp-dlg-title">Create workspace</p>
                  <div className="lp-dlg-body">
                    <Field
                      label="Workspace name"
                      value={s.wsName}
                      placeholder="My Workspace"
                      focus={s.focus === "wsName"}
                    />
                    <Field
                      label="Workspace URL"
                      value={s.wsSlug}
                      placeholder="my-workspace"
                    />
                  </div>
                  <div className="lp-dlg-foot">
                    <Btn ghost>Cancel</Btn>
                    <Btn pressed={pressed("ws-create")}>Create workspace</Btn>
                  </div>
                </>
              )}

              {s.dialog === "project" && (
                <>
                  <p className="lp-dlg-title">Create project</p>
                  <div className="lp-dlg-body">
                    <Field
                      label="Title"
                      value={s.prjTitle}
                      placeholder="Project title"
                      focus={s.focus === "prjTitle"}
                    />
                    <Field
                      label="Description (optional)"
                      value={s.prjDesc}
                      placeholder="What is this project about?"
                      focus={s.focus === "prjDesc"}
                      tall
                    />
                  </div>
                  <div className="lp-dlg-foot">
                    <Btn ghost>Cancel</Btn>
                    <Btn pressed={pressed("prj-create")}>Create project</Btn>
                  </div>
                </>
              )}

              {s.dialog === "task" && (
                <>
                  <p className="lp-dlg-title">Create task</p>
                  <div className="lp-dlg-body">
                    <Field
                      label="Title"
                      value={s.taskTitle}
                      placeholder="Task title"
                      focus={s.focus === "taskTitle"}
                    />
                    <Field
                      label="Description (optional)"
                      placeholder="What needs to be done?"
                      tall
                    />
                    <div className="lp-dlg-row">
                      <Field label="Status" value="Backlog" select />
                      <Field
                        label="Priority"
                        value={s.taskPriority === "HIGH" ? "High" : "Medium"}
                        focus={s.focus === "taskPriority"}
                        select
                      />
                    </div>
                    <Field
                      label="Assignee (optional)"
                      value="Unassigned"
                      select
                    />
                  </div>
                  <div className="lp-dlg-foot">
                    <Btn ghost>Cancel</Btn>
                    <Btn pressed={pressed("task-create")}>Create task</Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
