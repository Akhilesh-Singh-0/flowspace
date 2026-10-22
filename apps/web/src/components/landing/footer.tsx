import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";

function Brand() {
  return (
    <Link href="/" className="fs-footer-brand" aria-label="FlowSpace home">
      <span className="fs-footer-brand-icon">
        <Layers3 size={17} strokeWidth={1.8} />
      </span>
      <span>FlowSpace</span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="fs-footer">
      <div className="fs-footer-container">
        <div className="fs-footer-main">
          <div className="fs-footer-about">
            <Brand />
            <p>
              Projects, tasks, and team conversations in one shared workspace.
            </p>
          </div>

          <nav className="fs-footer-nav" aria-label="Footer navigation">
            <div className="fs-footer-nav-group">
              <h2>Product</h2>
              <a href="#product">Workspace</a>
              <a href="#features">Features</a>
              <a href="#collaboration">Collaboration</a>
            </div>

            <div className="fs-footer-nav-group">
              <h2>Account</h2>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Get started</Link>
            </div>
          </nav>
        </div>

        <div className="fs-footer-bottom">
          <p>© {new Date().getFullYear()} FlowSpace</p>

          <a className="fs-footer-back-top" href="#top">
            Back to top
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}