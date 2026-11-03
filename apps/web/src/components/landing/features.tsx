import Image from "next/image";
import { TaskDemo } from "@/components/landing/task-demo";

const statuses = [
  { label: "Backlog", color: "var(--status-backlog)", hollow: true },
  { label: "In Progress", color: "var(--status-progress)", hollow: false },
  { label: "In Review", color: "var(--status-review)", hollow: false },
  { label: "Done", color: "var(--status-done)", hollow: false },
  { label: "Cancelled", color: "var(--status-cancelled)", hollow: false },
];

const roles = [
  { name: "Owner", text: "Full control. Can't be removed." },
  { name: "Admin", text: "Manages projects and members." },
  { name: "Member", text: "Works on tasks." },
  { name: "Viewer", text: "Follows the work, can't create tasks." },
];

export function Features() {
  return (
    <section id="features" className="lp-section">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 className="lp-h2">Plan in a list, run it on a board.</h2>
        </div>

        <div className="lp-feature">
          <div className="lp-feature-copy">
            <h3 className="lp-h3">Assign it, discuss it, move it forward</h3>
            <p className="lp-copy">
              Open any task to set its status, priority and due date, assign it
              to someone and keep the conversation in its comments. See your
              tasks as a list or a board, search by title, and filter by status
              or priority.
            </p>
            <ul className="lp-statuses">
              {statuses.map((status) => (
                <li key={status.label}>
                  <span
                    className={`lp-dot${status.hollow ? " lp-dot-hollow" : ""}`}
                    style={
                      status.hollow
                        ? { borderColor: status.color }
                        : { backgroundColor: status.color }
                    }
                    aria-hidden="true"
                  />
                  {status.label}
                </li>
              ))}
            </ul>
          </div>

          <TaskDemo />
        </div>

        <div className="lp-feature lp-feature-reverse">
          <div className="lp-feature-copy">
            <h3 className="lp-h3">Control who can do what</h3>
            <p className="lp-copy">
              Invite people by email and give each one a role in the
              workspace.
            </p>
            <dl className="lp-roles">
              {roles.map((role) => (
                <div key={role.name} style={{ display: "contents" }}>
                  <dt>{role.name}</dt>
                  <dd>{role.text}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lp-shot">
            <Image
              src="/landing/members.png"
              alt="FlowSpace members page listing four people with Owner, Admin, Member and Viewer roles"
              width={2880}
              height={1800}
              sizes="(min-width: 1120px) 640px, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
