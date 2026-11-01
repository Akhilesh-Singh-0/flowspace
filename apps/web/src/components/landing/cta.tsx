import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="lp-cta">
      <div className="lp-container lp-cta-inner">
        <div>
          <h2 className="lp-h2">Set up your first workspace.</h2>
          <p className="lp-copy">
            Create a workspace, add a project and invite your team.
          </p>
        </div>

        <div className="lp-actions">
          <Button href="/sign-up">Get started</Button>
          <Button href="/sign-in" variant="secondary">
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}
