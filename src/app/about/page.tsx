"use client";

import Link from "next/link";
import { ArrowLeft, Code2, MapPin, Phone, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-6xl">
            KK Yellow
          </h1>
          <p className="text-xl text-muted-foreground">
            Serving tradition, warmth, and flavor in every bite.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 md:grid-cols-2">

          {/* Restaurant Section */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Our Story</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              At KK Yellow, we believe food is more than just fuel—it&apos;s a celebration of culture and community.
              Our kitchen is dedicated to bringing you the freshest ingredients and the most authentic recipes.
              Whether it&apos;s our signature Firfir or a quick snack, everything is made with &lsquo;hot hands&rsquo; and love.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <MapPin className="h-5 w-5 text-secondary" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone className="h-5 w-5 text-secondary" />
                <span>+251 911 000 000</span>
              </div>
            </div>
          </div>

          {/* Tech Partner Section (ASCII Technologies) */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Code2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Technology Partner</h2>
            </div>

            <p className="mb-6 leading-relaxed text-muted-foreground">
              This digital ordering experience is powered by <strong>ASCII Technologies PLC</strong>.
              We craft modern, scalable, and user-centric software solutions for businesses in Ethiopia and beyond.
            </p>

            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Developer</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="https://aasciihub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  www.aasciihub.com
                </a>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Bole, Addis Ababa</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KK Yellow. All rights reserved. <br />
            <span className="opacity-75">Digitized by ASCII Technologies PLC.</span>
          </p>
        </div>
      </div>
    </main>
  );
}
