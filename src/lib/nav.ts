export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function shopProductPath(title: string) {
  return `/product/${slugify(title)}`;
}

export function shopVariantId(title: string) {
  return `var_${slugify(title)}`;
}

export function navigate(path: string) {
  if (!path || path === '#') return;
  if (path.startsWith('#')) {
    const target = document.querySelector<HTMLElement>(path);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
    return;
  }
  const url = new URL(path, window.location.origin);
  if (url.origin !== window.location.origin) {
    window.location.assign(path);
    return;
  }
  if (url.pathname === window.location.pathname && url.hash) {
    const target = document.querySelector<HTMLElement>(url.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
    return;
  }
  window.history.pushState({}, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (url.hash) {
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(url.hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target?.focus({ preventScroll: true });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
