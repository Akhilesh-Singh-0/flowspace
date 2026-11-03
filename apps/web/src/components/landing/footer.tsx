import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const REPO = "https://github.com/Akhilesh-Singh-0/flowspace";

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-cols">
          <div className="lp-footer-col">
            <h2 className="lp-footer-title">Product</h2>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#workflow">Workflow</a>
              </li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h2 className="lp-footer-title">Account</h2>
            <ul>
              <li>
                <Link href="/sign-in">Sign in</Link>
              </li>
              <li>
                <Link href="/sign-up">Create a workspace</Link>
              </li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h2 className="lp-footer-title">Project</h2>
            <ul>
              <li>
                <a href={REPO} target="_blank" rel="noopener noreferrer">
                  Source on GitHub
                </a>
              </li>
              <li>
                <a
                  href={`${REPO}#readme`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  README
                </a>
              </li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h2 className="lp-footer-title">Built with</h2>
            <ul>
              <li>Next.js</li>
              <li>Express</li>
              <li>Prisma</li>
              <li>Redis</li>
              <li>Clerk</li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-mark" aria-hidden="true">
          <Logo size={160} className="lp-mark" />
          <span className="lp-footer-word">FlowSpace</span>
        </div>

        <p className="lp-footer-base">© 2026 FlowSpace</p>
      </div>
    </footer>
  );
}
