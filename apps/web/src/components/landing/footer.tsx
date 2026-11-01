import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-brand">
          <Link href="/" className="lp-brand" aria-label="FlowSpace home">
            <Logo size={20} />
            FlowSpace
          </Link>
          <small>© 2026 FlowSpace</small>
        </div>

        <nav className="lp-footer-links" aria-label="Footer">
          <a
            href="https://github.com/Akhilesh-Singh-0/flowspace"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-text-link"
          >
            GitHub
          </a>
          <Link href="/sign-in" className="lp-text-link">
            Sign in
          </Link>
          <Link href="/sign-up" className="lp-text-link">
            Get started
          </Link>
        </nav>
      </div>
    </footer>
  );
}
