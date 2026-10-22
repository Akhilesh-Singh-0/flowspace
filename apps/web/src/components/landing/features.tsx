import {
  ArrowUpRight,
  Check,
  CheckSquare,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="fs-features-section">
      <div className="fs-features-container">
        <header className="fs-features-intro">
          <p className="fs-eyebrow">
            <span aria-hidden="true" />
            BUILT AROUND THE WORK
          </p>

          <div className="fs-features-intro-grid">
            <h2>Work stays connected.</h2>

            <p>
              Projects give work a home. Tasks make ownership clear.
              Discussions keep the context where your team needs it.
            </p>
          </div>
        </header>

        <article className="fs-feature-primary">
          <div className="fs-feature-primary-copy">
            <span className="fs-feature-index">01 / PROJECTS</span>

            <FolderKanban
              className="fs-feature-primary-icon"
              size={21}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <h3>Start with a shared view of the work.</h3>

            <p>
              Keep related tasks together and give everyone a clear place
              to find what belongs to a project.
            </p>

            <a className="fs-feature-text-link" href="#product">
              Explore the workspace
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="fs-feature-project-preview">
            <div className="fs-feature-preview-heading">
              <div>
                <span className="fs-feature-preview-label">WORKSPACE</span>
                <h4>Studio workspace</h4>
              </div>

              <span className="fs-feature-preview-count">03 projects</span>
            </div>

            <div className="fs-feature-project-line">
              <span className="fs-feature-project-name">
                <span className="fs-feature-dot fs-feature-dot-rose" />
                Product
              </span>

              <span>Onboarding and product improvements</span>

              <span className="fs-feature-project-arrow">
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </div>

            <div className="fs-feature-project-line">
              <span className="fs-feature-project-name">
                <span className="fs-feature-dot fs-feature-dot-blue" />
                Engineering
              </span>

              <span>API, infrastructure, and implementation</span>

              <span className="fs-feature-project-arrow">
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </div>

            <div className="fs-feature-project-line">
              <span className="fs-feature-project-name">
                <span className="fs-feature-dot fs-feature-dot-green" />
                Operations
              </span>

              <span>Planning and ongoing maintenance</span>

              <span className="fs-feature-project-arrow">
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </div>
          </div>
        </article>

        <div className="fs-feature-supporting">
          <article className="fs-feature-support">
            <span className="fs-feature-index">02 / TASKS</span>

            <CheckSquare
              className="fs-feature-support-icon fs-feature-support-blue"
              size={19}
              aria-hidden="true"
            />

            <h3>Make the next step clear.</h3>

            <p>
              Track status, priority, and ownership without losing sight
              of the larger project.
            </p>

            <div className="fs-feature-task-line">
              <CheckSquare size={14} aria-hidden="true" />
              <span className="fs-feature-task-name">Review API changes</span>
              <span className="fs-feature-task-status">In review</span>
            </div>
          </article>

          <article className="fs-feature-support">
            <span className="fs-feature-index">03 / DISCUSSIONS</span>

            <MessageSquare
              className="fs-feature-support-icon fs-feature-support-green"
              size={19}
              aria-hidden="true"
            />

            <h3>Keep the context close.</h3>

            <p>
              Keep feedback and decisions alongside the tasks they belong to.
            </p>

            <div className="fs-feature-comment-line">
              <span className="fs-feature-comment-avatar">AS</span>
              <span className="fs-feature-comment-text">Ready for review.</span>
              <Check size={14} aria-hidden="true" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}