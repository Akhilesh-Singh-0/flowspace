import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Brand() {
  return (
    <Link href="/" className="fs-brand" aria-label="FlowSpace home">
      <span className="fs-brand-mark" aria-hidden="true">
        <Layers3 size={17} strokeWidth={1.8} />
      </span>
      <span>FlowSpace</span>
    </Link>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.62 5.23-5.11 5.51.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="fs-navbar">
      <nav className="fs-navbar-inner" aria-label="Main navigation">
        <div className="fs-navbar-brand">
          <Brand />
        </div>

        <div className="fs-navbar-links">
          <a href="#product">Product</a>
          <a href="#docs">Docs</a>
          <a href="#help">Help</a>
        </div>

        <div className="fs-navbar-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fs-navbar-github"
            aria-label="GitHub"
            title="GitHub"
          >
            <GitHubIcon />
          </a>

          <Link href="/sign-in" className="fs-navbar-signin">
            Sign in
          </Link>

          <Button href="/sign-up" variant="primary">
            Get started
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </nav>
    </header>
  );
}