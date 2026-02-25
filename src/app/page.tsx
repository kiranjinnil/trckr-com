import { TripForm } from "@/components/trip-form";
import { Plane, MapPin, Calendar, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-radial bg-grid-pattern">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ZiroPlans</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <span>AI-Powered Travel Planning</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Your Dream Trip,{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Planned by AI
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Tell us where you want to go and we&apos;ll create a day-by-day itinerary
          with optimized routes, budget breakdowns, and local recommendations.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { icon: MapPin, label: "Smart Route Planning" },
            { icon: Calendar, label: "Day-by-Day Itinerary" },
            { icon: Shield, label: "Budget Optimization" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="container mx-auto px-4 pb-20">
        <TripForm />
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZiroPlans. Powered by AI.</p>
        </div>
      </footer>
    </main>
  );
}
