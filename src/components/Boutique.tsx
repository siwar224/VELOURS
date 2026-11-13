"use client";

import { useId, useState, type FormEvent } from "react";
import { boutique, brand, nav } from "@/content/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Newsletter: front-end validation only, nothing is sent anywhere.
function Newsletter() {
  const { newsletter } = boutique;
  const inputId = useId();
  const messageId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(EMAIL_RE.test(email.trim()) ? "success" : "error");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8">
      <label htmlFor={inputId} className="sr-only">
        {newsletter.placeholder}
      </label>
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={newsletter.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby={messageId}
          className="min-w-0 flex-1 border-b border-champagne/50 bg-transparent py-3 text-creme placeholder:text-creme/60 focus:border-champagne"
        />
        <button type="submit" className="btn shrink-0">
          {newsletter.button}
        </button>
      </div>
      <p
        id={messageId}
        role="status"
        className={`mt-4 min-h-6 text-sm ${status === "error" ? "text-rose" : "text-champagne"}`}
      >
        {status === "error" ? newsletter.error : status === "success" ? newsletter.success : ""}
      </p>
    </form>
  );
}

// PLACEHOLDER: fictional address, hours and small print.
export function Boutique() {
  return (
    <footer id="boutique" aria-labelledby="boutique-title" className="bg-nuit px-6 pt-28 pb-12 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <p className="label">{boutique.label}</p>
            <h2 id="boutique-title" className="mt-6 font-display text-5xl leading-[1.02] text-creme md:text-6xl">
              {boutique.title}
            </h2>
            <address className="mt-10 not-italic leading-relaxed text-creme/80">
              {boutique.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="md:col-span-3">
            <h3 className="label">Hours</h3>
            <dl className="mt-6 space-y-4">
              {boutique.hours.map((h) => (
                <div key={h.days}>
                  <dt className="text-sm text-creme/60">{h.days}</dt>
                  <dd className="text-creme">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-4">
            <h3 className="label">{boutique.newsletter.title}</h3>
            <p className="mt-6 leading-relaxed text-creme/80">{boutique.newsletter.text}</p>
            <Newsletter />
          </div>
        </div>

        <span className="rule mt-24" aria-hidden="true" />
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-2xl tracking-[var(--tracking-wordmark)] text-creme">{brand.name}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="label !text-creme/70 transition-colors hover:!text-champagne">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 max-w-xl text-xs leading-relaxed text-creme/55">{boutique.smallPrint}</p>
      </div>
    </footer>
  );
}
