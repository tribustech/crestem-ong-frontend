import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Star } from "lucide-react";

export function Hero() {
  return (
    <section
      className="min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0d1b35 0%, #162040 60%, #1a3a5c 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-0 w-150 h-150 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #2dbe8f, transparent 70%)",
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(45,190,143,0.15)",
              color: "#2dbe8f",
              border: "1px solid rgba(45,190,143,0.3)",
            }}
          >
            <Star size={12} />
            Platforma #1 pentru organizații din România
          </div>
          <h1
            className="mb-6 text-white font-heading"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            ONG-ul tău la{" "}
            <span style={{ color: "#2dbe8f" }}>următorul nivel</span>
          </h1>
          <p
            className="mb-8 leading-relaxed"
            style={{
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.72)",
              maxWidth: "480px",
            }}
          >
            Crestem este platforma care reunește resurse, instrumente juridice,
            programe de accelerare și o comunitate vibrantă pentru toți cei care
            construiesc schimbarea în România.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/inregistrare"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: "#2dbe8f",
                boxShadow: "0 4px 24px rgba(45,190,143,0.35)",
              }}
            >
              Înregistrează-te <ArrowRight size={18} />
            </Link>
            <Link
              href="/biblioteca"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
              style={{
                color: "rgba(255,255,255,0.85)",
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              Explorează resurse <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=700&h=500&fit=crop"
              alt="Echipă ONG"
              width={700}
              height={500}
              className="w-full h-80 lg:h-96 object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
