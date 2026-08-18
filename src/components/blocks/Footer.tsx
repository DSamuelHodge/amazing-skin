import { mockData } from "@/src/data/mockData";

export function Footer() {
  const { footer, nav } = mockData;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-900/60 bg-forest-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 md:gap-6 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <a 
              href="/"
              aria-label="Lumina Skin Rituals Home"
              className="flex bg-center w-[100px] h-[36px] bg-cover invert gap-x-2 gap-y-2 items-center"
              style={{ backgroundImage: `url(${nav.logo})` }}
            />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-emerald-200 max-w-sm">
            {footer.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-emerald-200">
          {footer.links.map((link, i) => (
            <a key={i} href={link.href} className="hover:text-emerald-50 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-[0.7rem] text-emerald-400">
          © <span>{currentYear}</span> Lumina Skin Rituals. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
