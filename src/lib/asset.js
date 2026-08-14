// Prefixes asset paths with Vite's base URL so absolute paths like
// "/images/..." work both locally (dev) and when hosted in a GitHub Pages
// subfolder (e.g. /ML-Studio-Backend/).
export const asset = (path) => {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};
