import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Reveal } from "../components/Reveal";

const valuePropositions = [
  {
    metric: "Full-Stack Delivery",
    title: "Collaborative full-stack engineering",
    desc: "Shipped three team products end-to-end at The Digital Hub — from bookings with payments to real-time audio — across React, Next.js and Angular with Node.js and NestJS backends.",
  },
  {
    metric: "Architecture & Security",
    title: "Security and architecture aware",
    desc: "Auth flows built on JWT, OTP and RBAC, time-slot conflict detection, typed contracts, and parameterized queries — code engineered to stay reliable and understandable after launch.",
  },
  {
    metric: "Communication",
    title: "Clear communication and growth",
    desc: "Technical instructor experienced at translating complex engineering concepts into simple workflows, with fluent English for cross-functional teams.",
  },
];

export function HireCta() {
  return (
    <section id="hireme" className="section relative">
      <div className="container-x space-y-12">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Why hire Mahmoud</span>
          <h2 className="heading mt-4">
            Contributing across frontend, backend, data, and real-time systems.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {valuePropositions.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <div className="group relative h-full border-t border-line py-6 sm:py-7">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {item.metric}
                </span>
                <h3 className="mb-3 mt-3 font-display text-base font-bold text-ink">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex justify-center">
          <Link to="/contact" className="btn-primary btn-lg group">
            Start a conversation
            <FiArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
