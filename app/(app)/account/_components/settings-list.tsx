import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SettingsItem = {
  key: string;
  title: string;
  description: string;
  href?: string;
  value?: string;
  available: boolean;
  hint?: string;
};

type Props = {
  items: SettingsItem[];
};

export function SettingsList({ items }: Props) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {items.map((item) => (
        <SettingsRow key={item.key} item={item} />
      ))}
    </div>
  );
}

function SettingsRow({ item }: { item: SettingsItem }) {
  const content = <SettingsRowContent item={item} />;

  if (item.available && item.href) {
    return (
      <Link
        href={item.href}
        className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3.5",
        "opacity-[0.55]",
      )}
    >
      {content}
    </div>
  );
}

function SettingsRowContent({ item }: { item: SettingsItem }) {
  return (
    <>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium tracking-tight">
          {item.title}
          {!item.available && item.hint && (
            <Badge
              variant="outline"
              className="font-mono text-[0.625rem] uppercase tracking-wider"
            >
              {item.hint}
            </Badge>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {item.description}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {item.value && (
          <span className="hidden font-mono text-[0.6875rem] text-muted-foreground sm:inline">
            {item.value}
          </span>
        )}
        {item.available && (
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
          />
        )}
      </div>
    </>
  );
}
