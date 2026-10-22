import {
  ArrowRight,
  Check,
  Circle,
  CircleDot,
  Layers3,
  ListFilter,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tasks = [
  {
    id: "FS-104",
    title: "Refine onboarding flow",
    project: "Product",
    status: "In progress",
    priority: "High",
    owner: "AS",
    color: "rose",
  },
  {
    id: "FS-103",
    title: "Review API error handling",
    project: "Engineering",
    status: "In review",
    priority: "Medium",
    owner: "RK",
    color: "blue",
  },
  {
    id: "FS-102",
    title: "Update workspace settings",
    project: "Product",
    status: "Backlog",
    priority: "Low",
    owner: "MS",
    color: "amber",
  },
  {
    id: "FS-101",
    title: "Document deployment process",
    project: "Engineering",
    status: "Done",
    priority: "Medium",
    owner: "JD",
    color: "green",
  },
] as const;

const projects = [
  { name: "Product", color: "rose" },
  { name: "Engineering", color: "blue" },
  { name: "Operations", color: "green" },
] as const;

function Avatar({
  initials,
  color,
}: {
  initials: string;
  color: string;
}) {
  return (
    <span className={`fs-avatar fs-avatar-${color}`} aria-label={initials}>
      {initials}
    </span>
  );
}

function ProductPreview() {
  return (
    <div className="fs-product-preview">
      <div className="fs-preview-label">
        <span>WORKSPACE OVERVIEW</span>
        <span>Illustrative preview</span>
      </div>

      <div className="fs-product-window">
        <header className="fs-product-toolbar">
          <div className="fs-product-identity">
            <span className="fs-product-mark" aria-hidden="true">
              <Layers3 size={15} />
            </span>
            <strong>FlowSpace</strong>
            <span className="fs-product-divider">/</span>
            <span className="fs-workspace-name">Studio workspace</span>
          </div>

          <div className="fs-product-toolbar-actions">
            <span className="fs-search">
              <Search size={12} />
              Search
              <kbd>⌘ K</kbd>
            </span>
            <Avatar initials="AS" color="rose" />
          </div>
        </header>

        <div className="fs-product-layout">
          <aside className="fs-sidebar" aria-label="Workspace preview">
            <p className="fs-overline">WORKSPACE</p>

            <div className="fs-sidebar-item fs-sidebar-item-active">
              <Layers3 size={14} />
              Projects
            </div>

            <div className="fs-sidebar-item">
              <Users size={14} />
              Members
            </div>

            <div className="fs-sidebar-divider" />
            <p className="fs-overline">YOUR PROJECTS</p>

            {projects.map((project) => (
              <div className="fs-project-item" key={project.name}>
                <span
                  className={`fs-project-dot fs-project-dot-${project.color}`}
                  aria-hidden="true"
                />
                {project.name}
              </div>
            ))}

            <div className="fs-sidebar-note">
              <MessageSquare size={14} />
              <span>Keep discussions with the work.</span>
            </div>
          </aside>

          <div className="fs-task-panel">
            <div className="fs-task-heading">
              <div>
                <p className="fs-breadcrumb">Studio workspace / Product</p>
                <h2>Product tasks</h2>
                <p className="fs-task-subtitle">
                  Manage work and see what comes next.
                </p>
              </div>

              <Button variant="primary">
                <Plus size={14} />
                New task
              </Button>
            </div>

            <div className="fs-task-controls">
              <span className="fs-filter-button">
                <ListFilter size={12} />
                All tasks
              </span>

              <span className="fs-task-team">
                <Users size={12} />
                Team tasks
              </span>
            </div>

            <div className="fs-task-table">
              <div className="fs-task-row fs-task-table-header">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span />
              </div>

              {tasks.map((task) => (
                <div className="fs-task-row" key={task.id}>
                  <div className="fs-task-cell">
                    {task.status === "Done" ? (
                      <Check
                        className="fs-completed-icon"
                        size={14}
                        aria-label="Completed"
                      />
                    ) : (
                      <Circle
                        className="fs-task-circle"
                        size={14}
                        aria-hidden="true"
                      />
                    )}

                    <div className="fs-task-copy">
                      <p className="fs-task-title">{task.title}</p>
                      <p className="fs-task-meta">
                        {task.id} · {task.project}
                      </p>
                    </div>
                  </div>

                  <span className={`fs-status fs-status-${task.color}`}>
                    <CircleDot size={10} />
                    {task.status}
                  </span>

                  <span className="fs-priority">{task.priority}</span>
                  <Avatar initials={task.owner} color={task.color} />
                </div>
              ))}
            </div>

            <div className="fs-task-footer">
              <span>4 sample tasks</span>
              <span>Project overview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="product" className="fs-hero-section">
      <div className="fs-hero-copy">
        <p className="fs-eyebrow">
          <span aria-hidden="true" />
          PROJECTS / TASKS / TEAMWORK
        </p>

        <h1>Your team&apos;s work, in one place.</h1>

        <p className="fs-hero-description">
          Organize projects, track tasks, and keep conversations connected
          to the work. See what needs doing and what comes next.
        </p>

        <div className="fs-hero-actions">
          <Button href="/sign-up" variant="primary">
            Create a workspace
            <ArrowRight size={14} />
          </Button>

          <Button href="#features" variant="secondary">
            Explore features
          </Button>
        </div>
      </div>

      <div className="fs-hero-preview-wrap">
        <ProductPreview />
      </div>
    </section>
  );
}