import Link from "next/link";
import type { ReactNode } from "react";

import { blogConfig } from "@/blog.config";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="shell">
      <header className="site-header">
        <Link className="site-title" href="/">
          {blogConfig.site.title}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {blogConfig.theme.navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      {blogConfig.site.copyright ? (
        <footer className="site-footer">
          <p>{blogConfig.site.copyright}</p>
        </footer>
      ) : null}
    </div>
  );
}
