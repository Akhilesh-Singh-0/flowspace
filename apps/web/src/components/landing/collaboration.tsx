import {
  Activity,
  ArrowUpRight,
  Check,
  CircleDot,
  MessageSquare,
} from "lucide-react";

const activities = [
  {
    initials: "AS",
    name: "Alex",
    action: "moved a task to",
    target: "In progress",
    detail: "Build workspace settings",
    time: "Just now",
    color: "blue",
  },
  {
    initials: "RK",
    name: "Riya",
    action: "commented on",
    target: "API error handling",
    detail: "The edge cases are covered. Ready for review.",
    time: "12 min ago",
    color: "rose",
  },
  {
    initials: "JM",
    name: "Jordan",
    action: "completed",
    target: "Project setup",
    detail: "Initial structure is ready.",
    time: "28 min ago",
    color: "green",
  },
];

export function Collaboration() {
  return (
    <section
      id="collaboration"
      className="fs-collaboration-section"
      aria-labelledby="fs-collaboration-title"
    >
      <div className="fs-collaboration-container">
        <div className="fs-collaboration-preview">
          <div className="fs-collaboration-preview-header">
            <div className="fs-collaboration-heading-icon">
              <Activity size={17} />
            </div>

            <div>
              <h3>Project activity</h3>
              <p>Workspace / Engineering</p>
            </div>

            <span className="fs-collaboration-live">
              <span />
              Activity
            </span>
          </div>

          <div className="fs-collaboration-feed">
            {activities.map((activity) => (
              <article
                className="fs-collaboration-activity"
                key={`${activity.initials}-${activity.detail}`}
              >
                <span
                  className={`fs-collaboration-avatar fs-collaboration-avatar-${activity.color}`}
                >
                  {activity.initials}
                </span>

                <div className="fs-collaboration-activity-content">
                  <p>
                    <strong>{activity.name}</strong>{" "}
                    {activity.action}{" "}
                    <span className="fs-collaboration-target">
                      {activity.target}
                    </span>
                  </p>

                  <div className="fs-collaboration-detail">
                    {activity.detail}
                  </div>

                  <span className="fs-collaboration-time">
                    {activity.time}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="fs-collaboration-preview-footer">
            <MessageSquare size={15} />
            <span>Updates and discussion, together.</span>
            <Check size={15} />
          </div>
        </div>

        <div className="fs-collaboration-copy">
          <p className="fs-eyebrow">
            <span aria-hidden="true" />
            SHARED CONTEXT
          </p>

          <h2 id="fs-collaboration-title">
            Less searching. More moving forward.
          </h2>

          <p className="fs-collaboration-description">
            See what changed, follow task discussions, and keep decisions
            connected to the work. Your team can pick up where things left off.
          </p>

          <ul className="fs-collaboration-points">
            <li>
              <CircleDot size={17} />
              <span>Updates that are easy to follow</span>
            </li>
            <li>
              <MessageSquare size={17} />
              <span>Comments attached to their tasks</span>
            </li>
            <li>
              <Check size={17} />
              <span>A clearer view of what has changed</span>
            </li>
          </ul>

          <a className="fs-collaboration-link" href="#product">
            Back to the workspace
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}