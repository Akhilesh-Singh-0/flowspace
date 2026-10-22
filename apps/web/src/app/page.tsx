import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { Collaboration } from "@/components/landing/collaboration";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="fs-landing">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <Collaboration />
      <CTA />
      <Footer />
    </main>
  );
}