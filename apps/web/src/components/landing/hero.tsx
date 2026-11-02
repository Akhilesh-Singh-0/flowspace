import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-container">
        <div className="lp-hero-head">
          <h1 className="lp-h1">Track every task from backlog to done.</h1>

          <div>
            <p className="lp-lede">
              FlowSpace organizes work into workspaces and projects, with list
              and board views, assignees, due dates, labels and comments.
            </p>

            <div className="lp-actions">
              <Button href="/sign-up">Create a workspace</Button>
              <Button href="#workflow" variant="secondary">
                See the workflow
              </Button>
            </div>
          </div>
        </div>

        <div className="lp-shot">
          <Image
            src="/landing/tasks.png"
            alt="FlowSpace task list with one task open in the detail panel, showing its status, priority, due date, assignee, labels and comments"
            width={2880}
            height={1800}
            sizes="(min-width: 1120px) 1072px, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}