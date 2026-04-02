import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel
}: PageHeaderProps) {
  return (
    <header className="page-head">
      <div>
        {backHref && backLabel ? (
          <Link className="text-link" href={backHref}>
            {backLabel}
          </Link>
        ) : null}
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
      </div>
      <p className="page-lead">{description}</p>
    </header>
  );
}
