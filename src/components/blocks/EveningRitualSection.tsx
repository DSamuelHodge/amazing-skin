import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function EveningRitualSection() {
  const { eveningRitual } = mockData;

  return (
    <section className="text-stone-900 bg-[#f4eadf] w-full border-stone-200/80 border-t">
      <div className="sm:px-6 lg:px-8 lg:py-20 max-w-6xl mx-auto pt-14 px-4 pb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <motion.div 
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-stone-600 mb-3">
              {eveningRitual.tag}
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight tracking-tight text-stone-900">
              {eveningRitual.title} <span className="italic text-stone-700">{eveningRitual.titleItalic}</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-700">
              {eveningRitual.description}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4 text-xs sm:text-sm text-stone-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {eveningRitual.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-[0.7rem] font-semibold text-[#f4eadf]">
                  {i + 1}
                </span>
                <span>{step.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {eveningRitual.steps.map((step, i) => (
            <motion.article 
              key={i}
              className="group rounded-3xl border border-stone-200 bg-[#f7efe4] px-5 py-6 sm:px-6 sm:py-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-[0.75rem] font-semibold text-[#f4eadf]">
                      {step.number}
                    </span>
                    <span className="tracking-[0.18em] uppercase">{step.name}</span>
                  </div>
                  <Badge variant={i === 1 ? "amber" : "stone"}>{step.tag}</Badge>
                </div>
                <h3 className="font-playfair text-xl font-semibold tracking-tight text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-stone-700">
                  {step.description}
                </p>
                <ul className="mt-4 space-y-2 text-xs sm:text-sm text-stone-700">
                  {step.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full bg-stone-800"></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <span className="font-semibold">{step.price}</span>
                  <span className="text-stone-600">• {step.size}</span>
                </div>
                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 group-hover:underline underline-offset-4">
                  <span>Add to ritual</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div 
          className="mt-12 flex flex-col lg:flex-row gap-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[#f7efe4]">
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/5 via-transparent to-amber-200/40 pointer-events-none"></div>
              <img src={eveningRitual.highlight.image} alt="Soft evening self-care moment" className="sm:h-72 lg:h-80 w-full h-64 object-cover" />
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-stone-600 mb-2">
              {eveningRitual.highlight.tag}
            </p>
            <h3 className="font-playfair text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              {eveningRitual.highlight.title}
            </h3>
            <p className="mt-4 text-sm sm:text-base text-stone-700">
              {eveningRitual.highlight.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-xs sm:text-sm">
              {eveningRitual.highlight.stats.map((stat, i) => (
                <div key={i}>
                  <dt className="text-stone-600">{stat.label}</dt>
                  <dd className="text-stone-900 font-semibold mt-1">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <Button variant="light" className="mt-6">
              Build my evening ritual
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="mt-2 text-[0.7rem] text-stone-600">
              {eveningRitual.highlight.note}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
