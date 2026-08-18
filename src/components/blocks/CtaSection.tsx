import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";

export function CtaSection() {
  const { cta } = mockData;

  return (
    <section className="text-emerald-50 bg-[#0b0f0e] w-full border-t border-emerald-900/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-10">
          <motion.div 
            className="w-full lg:w-1/2 flex flex-col justify-center"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-emerald-300 mb-3">
              {cta.tag}
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight tracking-tight">
              {cta.title} <span className="italic text-emerald-300">{cta.titleItalic}</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-emerald-100 max-w-lg">
              {cta.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button variant="primary" size="md">
                Start my ritual quiz
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="dark" size="md">
                Browse all products
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-[0.7rem] sm:text-xs text-emerald-300">
              {cta.bullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[0.65rem] text-emerald-200">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-3xl border border-emerald-900/70 bg-gradient-to-br from-[#111715] via-[#0c1411] to-[#102019] overflow-hidden shadow-sm">
              <div className="absolute -top-20 right-[-40px] w-56 h-56 bg-emerald-500/20 blur-3xl"></div>
              <div className="absolute -bottom-16 left-[-40px] w-52 h-52 bg-emerald-600/20 blur-3xl"></div>

              <div className="relative px-6 py-7 sm:px-8 sm:py-9 flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-[0.18em] uppercase text-emerald-300 mb-2">
                      {cta.sampleRitual.tag}
                    </p>
                    <p className="text-sm text-emerald-100">
                      {cta.sampleRitual.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-100">
                    <span className="inline-flex h-7 px-3 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/50">
                      {cta.sampleRitual.time}
                    </span>
                    <span className="inline-flex h-7 px-3 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40">
                      {cta.sampleRitual.stepsCount}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {cta.sampleRitual.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[0.75rem] font-medium text-emerald-200">
                        {step.number}
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-[0.18em] uppercase text-emerald-300">
                          {step.name}
                        </p>
                        <p className="text-sm text-emerald-50 mt-1">
                          {step.product}
                        </p>
                        <p className="text-xs text-emerald-200 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-emerald-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[0.75rem] sm:text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {cta.sampleRitual.stats.avatars.map((avatar, i) => (
                        <img 
                          key={i} 
                          className="w-7 h-7 rounded-full border border-[#0b0f0e] object-cover" 
                          src={avatar} 
                          alt="Customer" 
                        />
                      ))}
                    </div>
                    <p>
                      <span className="font-medium text-emerald-50">{cta.sampleRitual.stats.count}</span> {cta.sampleRitual.stats.text}
                    </p>
                  </div>
                  <p className="text-emerald-400">
                    {cta.sampleRitual.stats.note}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
