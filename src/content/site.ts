// All brand and page copy lives here. Renaming the house is a one-line change to `brand.name`.
// Everything below is placeholder copy for a fictional perfume house.

export const brand = {
  name: "VELOURS",
  descriptor: "Eau de Parfum",
  tagline: "Blooming in every note",
  meaning: "French for “velvet”",
} as const;

export const meta = {
  title: `${brand.name} — ${brand.descriptor}`,
  description: `${brand.name}, a rose, peony and violet ${brand.descriptor.toLowerCase()}. ${brand.tagline}.`,
  ogImage: "/frames/desktop/f_0176.webp",
  themeColor: "#2E0A21",
} as const;

export const nav = {
  links: [
    { label: "Notes", href: "#notes" },
    { label: "Story", href: "#story" },
    { label: "Collection", href: "#collection" },
    { label: "Boutique", href: "#boutique" },
  ],
  cta: { label: "Discover", href: "#collection" },
} as const;

// Text layers over the pinned canvas, one per beat (frame ranges live in src/lib/beats.ts).
export const stage = {
  loading: "Loading the bloom",
  skipLink: "Skip the intro animation",
  srDescription:
    "A faceted rose-glass perfume bottle with a gold cap stands on a wine-coloured pedestal. Roses, peonies, violet petals and pink peppercorns bloom inside the glass, burst out and orbit the bottle, spiral into a trail of gold sparkles and a soft rose-gold mist, then clear to leave the bottle glinting in the light.",
  intro: {
    label: brand.descriptor,
    title: brand.name,
    text: "A rose that opens slowly, and never quite closes.",
    hint: "Scroll to bloom",
  },
  bloom: {
    label: "The Bloom",
    title: "Bloom in every note",
    text: "One drop, and the glass gives way to petals.",
  },
  heart: {
    label: "The Heart",
    title: "Rose, peony, violet",
    text: "Damask rose at the centre, peony for softness, a violet petal for shadow.",
  },
  trail: {
    label: "The Trail",
    title: "A rose-gold haze",
    text: "Pink pepper sparks, then settles into a warm mist that stays on the skin.",
  },
  finish: {
    label: "The Finish",
    title: "Leave a trace",
    text: "Long after you have left the room.",
    cta: { label: "Discover the collection", href: "#collection" },
  },
} as const;

export const notes = {
  label: "The Composition",
  title: "Three tiers, one bloom",
  intro: "Read it from the top down: bright first, tender at heart, warm to the end.",
  tiers: [
    {
      label: "Top",
      title: "The spark",
      notes: ["Pink pepper", "Bergamot"],
      text: "A bright, peppery opening that lifts the first breath.",
    },
    {
      label: "Heart",
      title: "The bloom",
      notes: ["Rose", "Peony", "Violet"],
      text: "Petals, layered: velvet rose, airy peony, a shadow of violet.",
    },
    {
      label: "Base",
      title: "The trace",
      notes: ["Musk", "Amber", "Vanilla"],
      text: "Skin-warm and slow. What remains hours later.",
    },
  ],
} as const;

export const story = {
  label: "The Story",
  title: "Made to open slowly",
  paragraphs: [
    `${brand.name} began with a single question: what does a rose smell like in the moment it opens, before the petals fall?`,
    "We built the answer in layers. Pepper to wake the senses, a heart of three flowers, and a base that lingers like warmth on a wrist. Bottled in faceted rose glass, capped in gold.",
  ],
  signature: `Maison ${brand.name}, Paris`,
} as const;

// PLACEHOLDER PRODUCTS: names, prices and sizes are invented for this portfolio piece.
export const collection = {
  label: "The Collection",
  title: "Three ways to bloom",
  products: [
    {
      name: "Rose Éclose",
      descriptor: "Damask rose, pink pepper, white musk",
      size: "50 ml",
      price: "€120",
      variant: "rose",
    },
    {
      name: "Pivoine Nuit",
      descriptor: "Night peony, blackcurrant, amber",
      size: "50 ml",
      price: "€135",
      variant: "pivoine",
    },
    {
      name: "Violette Brume",
      descriptor: "Violet leaf, iris, soft vanilla",
      size: "50 ml",
      price: "€128",
      variant: "violette",
    },
  ],
  cta: "Discover",
} as const;

export type ProductVariant = (typeof collection.products)[number]["variant"];

// PLACEHOLDER BOUTIQUE DETAILS: fictional address and hours.
export const boutique = {
  label: "The Boutique",
  title: "Visit the house",
  address: ["12 rue des Pétales", "75003 Paris, France"],
  hours: [
    { days: "Tuesday to Saturday", time: "11:00 – 19:00" },
    { days: "Sunday", time: "13:00 – 18:00" },
    { days: "Monday", time: "Closed" },
  ],
  newsletter: {
    title: "Letters from the house",
    text: "New blooms and quiet launches, a few times a year.",
    placeholder: "Your email",
    button: "Subscribe",
    success: "Thank you. Your first letter is on its way.",
    error: "Please enter a valid email address.",
  },
  smallPrint: `${brand.name} is a fictional perfume house created for a portfolio project. No products are for sale.`,
} as const;
