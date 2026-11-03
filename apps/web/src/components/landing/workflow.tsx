import type { CSSProperties } from "react";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    name: "Backlog",
    color: "var(--status-backlog)",
    hollow: true,
    text: "Create the task, set its priority and due date, and assign it to someone.",
  },
  {
    name: "In Progress",
    color: "var(--status-progress)",
    hollow: false,
    text: "The assignee picks it up. Labels and comments keep the details with the task.",
  },
  {
    name: "In Review",
    color: "var(--status-review)",
    hollow: false,
    text: "Teammates look it over and leave their feedback in the comments.",
  },
  {
    name: "Done",
    color: "var(--status-done)",
    hollow: false,
    text: "Mark it done. Work you decide against can be marked Cancelled.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="lp-section">
      <div className="lp-container">
        <div className="lp-section-head lp-split">
          <h2 className="lp-h2">How a task moves through a project.</h2>
          <p className="lp-copy">
            A task always has exactly one status. Change it from the task panel
            and the list and board update to match.
          </p>
        </div>

        <Reveal className="lp-draw">
          <div className="lp-track">
            <div className="lp-chip" aria-hidden="true">
              <span className="lp-chip-title">
                Refactor authentication middleware
              </span>
              <span className="lp-chip-meta">
                <span className="lp-chip-priority">
                  <span className="lp-bars lp-bars-urgent">
                    <span />
                    <span />
                    <span />
                  </span>
                  Urgent
                </span>
                <span className="lp-chip-dot" />
              </span>
            </div>

            <ol className="lp-steps">
              {steps.map((step) => (
                <li
                  key={step.name}
                  className={`lp-step${step.hollow ? " lp-step-hollow" : ""}`}
                  style={{ "--step-color": step.color } as CSSProperties}
                >
                  <h3 className="lp-step-title">{step.name}</h3>
                  <p className="lp-step-text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
