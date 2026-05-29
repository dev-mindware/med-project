import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { WordOfTheDay } from "@/components/word-of-the-day"
import { FeaturedActivities } from "@/components/featured-activities"
import { FeaturedArticles } from "@/components/featured-articles"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <FeaturedActivities />

        {/* Palavra do Dia */}
        <section className="py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Léxico</p>
              <h2 className="text-4xl font-extrabold tracking-tight mb-3">Palavra do Dia</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Descubra e aprenda uma nova palavra portuguesa todos os dias
              </p>
            </div>
            <WordOfTheDay />
          </div>
        </section>

        <FeaturedArticles />
      </main>
      <Footer />
    </div>
  )
}
