import Link from "next/link";
import { Fragment } from "react";

export type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  trail: Crumb[];
};

export function Breadcrumbs({ trail }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className="text-muted-foreground/60">
                  /
                </li>
              )}
              <li>
                {isLast || !crumb.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
