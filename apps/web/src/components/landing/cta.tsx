import { ArrowRight, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="fs-cta-section" aria-labelledby="fs-cta-title">
      <div className="fs-cta-container">
        <div className="fs-cta-mark" aria-hidden="true">
          <Layers3 size={21} strokeWidth={1.7} />
        </div>

        <p className="fs-eyebrow">
          <span aria-hidden="true" />
          YOUR NEXT PROJECT STARTS HERE
        </p>

        <h2 id="fs-cta-title">
          Bring your team's work together.
        </h2>

        <p className="fs-cta-description">
          Create a workspace, organize your projects, and give your team a
          shared place to move work forward.
        </p>

        <div className="fs-cta-actions">
          <Button href="/sign-up" variant="primary">
            Create a workspace
            <ArrowRight size={16} />
          </Button>

          <a className="fs-cta-secondary" href="#product">
            Explore FlowSpace
          </a>
        </div>
      </div>
    </section>
  );
}