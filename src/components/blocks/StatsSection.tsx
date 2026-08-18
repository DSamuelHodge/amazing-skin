import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function StatsSection() {
  const { numbers } = mockData;

  return (
    <section className="text-emerald-50 bg-[#0b0f0e] w-full border-emerald-900/60 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-10">
          <motion.div 
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[2.7rem] leading-tight tracking-tight">
              {numbers.title} <span className="italic text-emerald-300">{numbers.titleItalic}</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-emerald-100">
              {numbers.description}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-start gap-4 max-w-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xs sm:text-sm text-emerald-200">
              {numbers.note}
            </p>
            <Button variant="primary" size="sm">
              View full clinical report
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <div className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {numbers.stats.map((stat, i) => (
            <motion.article 
              key={i}
              className={`rounded-3xl px-6 py-7 sm:px-8 sm:py-9 flex flex-col justify-between ${
                i === 0 
                  ? "bg-emerald-300 text-emerald-950 shadow-sm border border-emerald-500/60" 
                  : i === 1 
                    ? "bg-[#0e1513] border border-emerald-900/70" 
                    : "bg-[#111715] border border-emerald-900/70"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div>
                <p className={`text-xs sm:text-sm font-medium tracking-[0.18em] uppercase mb-3 ${
                  i === 0 ? "text-emerald-900" : i === 1 ? "text-emerald-400" : "text-emerald-300"
                }`}>
                  {stat.tag}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  {stat.unit && (
                    <span className="text-lg sm:text-xl font-medium tracking-tight">{stat.unit}</span>
                  )}
                </div>
                <p className={`mt-1 text-sm sm:text-base ${
                  i === 0 ? "text-emerald-950" : "text-emerald-100"
                }`}>
                  {stat.label}
                </p>
              </div>
              <p className={`mt-5 text-xs sm:text-sm max-w-md ${
                i === 0 ? "text-emerald-950" : "text-emerald-200"
              }`}>
                {stat.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
