import {
  ArrowRight,
  Check,
  Circle,
  MessageSquare,
  Plus,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create a project",
    description: "Give related work a shared home.",
    color: "rose",
  },
  {
    number: "02",
    title: "Move tasks forward",
    description: "Set priorities, owners, and status.",
    color: "blue",
  },
  {
    number: "03",
    title: "Keep context together",
    description: "Discuss decisions beside the work.",
    color: "green",
  },
];

export function Workflow() {
  return (
    <section className="fs-workflow-section" aria-labelledby="fs-workflow-title">
      <div className="fs-workflow-container">
        <div className="fs-workflow-heading">
          <p className="fs-eyebrow">
            <span aria-hidden="true" />
            FROM PLAN TO DONE
          </p>

          <h2 id="fs-workflow-title">
            A clearer path from idea to done.
          </h2>

          <p>
            Give every project a place, every task an owner, and every
            conversation the context it needs.
          </p>
        </div>

        <div className="fs-workflow-layout">
          <div className="fs-workflow-steps">
            {steps.map((step) => (
              <article className="fs-workflow-step" key={step.number}>
                <span
                  className={`fs-workflow-step-number fs-workflow-${step.color}`}
                >
                  {step.number}
                </span>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>

                <ArrowRight
                  className="fs-workflow-step-arrow"
                  size={17}
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>

          <div className="fs-workflow-board" aria-label="Illustrative project workflow">
            <div className="fs-workflow-board-header">
              <div>
                <span className="fs-workflow-board-kicker">PROJECT</span>
                <h3>Website refresh</h3>
              </div>

              <button
                className="fs-workflow-add-button"
                type="button"
                aria-label="Illustrative add task button"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="fs-workflow-board-meta">
              <span className="fs-workflow-project-dot" />
              Design &amp; engineering
              <span className="fs-workflow-board-count">4 tasks</span>
            </div>

            <div className="fs-workflow-task-group">
              <div className="fs-workflow-group-title">
                <Circle size={13} />
                <span>TO DO</span>
                <span className="fs-workflow-task-count">2</span>
              </div>

              <div className="fs-workflow-task">
                <Circle size={15} />
                <span>Map the onboarding flow</span>
                <span className="fs-workflow-task-tag fs-workflow-tag-rose">
                  Design
                </span>
              </div>

              <div className="fs-workflow-task">
                <Circle size={15} />
                <span>Review empty states</span>
              </div>
            </div>

            <div className="fs-workflow-task-group">
              <div className="fs-workflow-group-title fs-workflow-title-blue">
                <Circle size={13} />
                <span>IN PROGRESS</span>
                <span className="fs-workflow-task-count">1</span>
              </div>

              <div className="fs-workflow-task fs-workflow-task-active">
                <Circle size={15} />
                <span>Build workspace settings</span>
                <span className="fs-workflow-avatar">AS</span>
              </div>
            </div>

            <div className="fs-workflow-task-group">
              <div className="fs-workflow-group-title fs-workflow-title-green">
                <Check size={13} />
                <span>DONE</span>
                <span className="fs-workflow-task-count">1</span>
              </div>

              <div className="fs-workflow-task fs-workflow-task-complete">
                <Check size={15} />
                <span>Set up project structure</span>
              </div>
            </div>

            <div className="fs-workflow-comment">
              <span className="fs-workflow-comment-icon">
                <MessageSquare size={15} />
              </span>

              <div>
                <p>Task discussion</p>
                <span>Context stays close to the work.</span>
              </div>

              <span className="fs-workflow-comment-dot" />
            </div>
          </div>
        </div>

        <p className="fs-workflow-note">
          An illustrative view of how projects, tasks, and discussions fit together.
        </p>
      </div>
    </section>
  );
}