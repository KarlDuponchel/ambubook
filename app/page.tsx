import { Suspense } from "react";
import {
  Header,
  Hero,
  TrustBadges,
  Reassurance,
  HowItWorks,
  CTAPro,
  Footer,
} from "@/components/landing";

function HeroSkeleton() {
  return (
    <section className="relative bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-100 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-10"></div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
              <div className="w-32 h-14 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>
        <TrustBadges />
        <Reassurance />
        <HowItWorks />
        <CTAPro />
      </main>
      <Footer />
    </div>
  );
}
