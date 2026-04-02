import { getHighlightParts } from "@/lib/filter-utils";

type HighlightedTextProps = {
  query: string;
  text: string;
};

export function HighlightedText({ query, text }: HighlightedTextProps) {
  const parts = getHighlightParts(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.matched ? (
          <mark className="match-highlight" key={`${part.text}-${index}`}>
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      )}
    </>
  );
}
