import Link from "next/link";

import type { BlogConfig } from "@/lib/blog-config";

type HomeProfileProps = {
  eyebrow: string;
  author: BlogConfig["site"]["author"];
};

function getAvatarFallback(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => Array.from(word)[0] || "")
      .join("")
      .toUpperCase();
  }

  return Array.from(name.trim()).slice(0, 2).join("").toUpperCase();
}

function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

export function HomeProfile({ eyebrow, author }: HomeProfileProps) {
  const fallback = getAvatarFallback(author.name);

  return (
    <section className="hero hero-profile">
      <div className="hero-portrait">
        <div className="hero-portrait-frame">
          {author.avatar?.src ? (
            <img
              alt={author.avatar.alt || `${author.name} avatar`}
              className="hero-avatar"
              loading="eager"
              src={author.avatar.src}
            />
          ) : (
            <div aria-hidden="true" className="hero-avatar-fallback">
              {fallback}
            </div>
          )}
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-topline">
          <p className="eyebrow">{eyebrow}</p>
          {author.handle ? <p className="hero-handle">{author.handle}</p> : null}
        </div>

        <div className="hero-heading">
          <h1>{author.name}</h1>
          {author.tagline ? <p className="hero-tagline">{author.tagline}</p> : null}
        </div>

        {author.bio ? <p className="hero-copy">{author.bio}</p> : null}

        {author.socialLinks && author.socialLinks.length > 0 ? (
          <div className="hero-links" aria-label="Social links">
            {author.socialLinks.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  className="hero-link"
                  href={link.href}
                  key={`${link.label}-${link.href}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="hero-link-label">{link.label}</span>
                  {link.text ? <span className="hero-link-text">{link.text}</span> : null}
                </a>
              ) : (
                <Link className="hero-link" href={link.href} key={`${link.label}-${link.href}`}>
                  <span className="hero-link-label">{link.label}</span>
                  {link.text ? <span className="hero-link-text">{link.text}</span> : null}
                </Link>
              )
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
