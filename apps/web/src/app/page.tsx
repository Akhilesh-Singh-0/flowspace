import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="fs-landing landing">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <CTA />
      <Footer />
    </main>
  );
}