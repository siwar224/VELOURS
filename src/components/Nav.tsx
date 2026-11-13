import { brand, nav } from "@/content/site";

// Transparent over the stage. The switch to a blurred prune bar after the stage arrives in block (d).
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-6 md:px-10"
      >
        <a
          href="#top"
          className="font-display text-lg tracking-[var(--tracking-wordmark)] text-creme md:text-xl"
          aria-label={`${brand.name}, back to top`}
        >
          {brand.name}
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="label !text-creme/80 transition-colors duration-300 hover:!text-champagne"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href={nav.cta.href} className="btn !px-5 !py-2.5">
          {nav.cta.label}
        </a>
      </nav>
    </header>
  );
}
