import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Sparkles, PlayCircle, Star, Droplets, Leaf, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";
import { navigate } from "@/src/lib/nav";

export function HeroSection() {
  const { hero } = mockData;

  return (
    <section className="sm:px-6 lg:px-8 lg:py-16 flex flex-col w-full max-w-6xl mx-auto pt-10 px-4 pb-10 justify-center">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 lg:mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="leading-tight sm:text-5xl lg:text-8xl text-4xl text-emerald-50 tracking-tight font-playfair">
            {hero.titleLine1}
          </h1>
          <h2 className="leading-tight sm:text-4xl lg:text-8xl text-3xl font-medium italic text-emerald-300 tracking-tight font-playfair mt-2">
            {hero.titleLine2}
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-emerald-50">
            {hero.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('#shop-section')}>
              Start your ritual
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('#evening-ritual')}>
              <PlayCircle className="w-4 h-4 text-emerald-300" />
              Watch 60s overview
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-4 self-start md:self-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium text-emerald-50">
              {hero.rating.score}
              <span className="text-xs text-emerald-300 ml-1">({hero.rating.reviews} reviews)</span>
            </p>
            <div className="-space-x-2 flex mt-1">
              {hero.rating.avatars.map((avatar, i) => (
                <img 
                  key={i} 
                  className="w-7 h-7 object-cover border-forest-bg border rounded-full" 
                  src={avatar} 
                  alt="" 
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] items-center">
        <motion.article 
          className="overflow-hidden bg-forest-surface rounded-3xl relative shadow-sm border border-emerald-900/60"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src={hero.mainImage} 
            alt="Close-up of calm, hydrated skin after the Lumina ritual" 
            width={1600}
            height={2000}
            fetchPriority="high"
            decoding="async"
            className="w-full h-[680px] object-cover aspect-[4/5]" 
          />
          <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
            <div className="bg-forest-elevated/95 backdrop-blur-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md max-w-xs border border-emerald-900/70">
              <div className="flex items-start gap-3">
                <div className="flex flex-none text-emerald-200 bg-emerald-900/50 w-9 h-9 rounded-full items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-50">{hero.badge.title}</p>
                  <p className="text-sm font-normal italic text-emerald-100">{hero.badge.subtitle}</p>
                  <p className="mt-1 text-xs text-emerald-200">{hero.badge.note}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        <div className="flex flex-col gap-6 lg:gap-7 h-full">
          <motion.article 
            className="sm:p-6 lg:p-7 flex flex-col sm:flex-row gap-6 bg-forest-elevated border-emerald-900/70 border rounded-3xl p-5 items-stretch justify-between"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-emerald-200 bg-emerald-900/60 w-9 h-9 rounded-full items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <Badge variant="emerald">{hero.features[0].tag}</Badge>
              </div>
              <div>
                <h3 className="font-playfair font-semibold tracking-tight text-xl text-emerald-50">
                  {hero.features[0].title}
                </h3>
                <p className="mt-1 font-playfair font-medium tracking-tight text-lg text-emerald-100 italic">
                  {hero.features[0].subtitle}
                </p>
                <p className="mt-3 text-sm text-emerald-100 max-w-sm">
                  {hero.features[0].description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-emerald-200">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{hero.features[0].note}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-28 sm:w-32 lg:w-36">
                <div className="absolute -top-3 -left-2 w-10 h-10 rounded-full bg-emerald-500/40 blur-2xl"></div>
                <img src={hero.features[0].image} alt="Refillable Lumina serum bottle" width={320} height={400} loading="lazy" decoding="async" className="w-full h-auto object-contain rounded-2xl relative drop-shadow-xl" />
              </div>
            </div>
          </motion.article>

          <motion.article 
            className="bg-forest-elevated rounded-3xl px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8 text-emerald-50 flex flex-col sm:flex-row gap-6 items-stretch overflow-hidden border border-emerald-900/70"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-emerald-200 mb-2">
                {hero.features[1].tag}
              </p>
              <h3 className="font-playfair text-2xl sm:text-[1.6rem] font-semibold tracking-tight text-emerald-50">
                {hero.features[1].title}
              </h3>
              <p className="mt-1 font-playfair text-lg font-medium tracking-tight text-emerald-100 italic">
                {hero.features[1].subtitle}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-200" />
                  <span>{hero.features[1].bullets?.[0]}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-200" />
                  <span>{hero.features[1].bullets?.[1]}</span>
                </li>
                <li className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-200" />
                  <span>{hero.features[1].bullets?.[2]}</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-xs">
                <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-emerald-700/40 blur-3xl"></div>
                <img src={hero.features[1].image} alt="Botanical leaf used in Lumina formulations" width={800} height={800} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-2xl relative aspect-square" />
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
