import type { SVGProps } from "react";

export function GoogleGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" strokeWidth="2" />
      <path
        d="M12 8.4v4.2h4.2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GithubGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="6" r="2.2" strokeWidth="1.8" />
      <circle cx="7" cy="18" r="2.2" strokeWidth="1.8" />
      <circle cx="17" cy="6" r="2.2" strokeWidth="1.8" />
      <path d="M7 8.2v7.6" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M17 8.2c0 3-2 4-4 4h-1.5c-1.7 0-3 1-3 3v.6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
