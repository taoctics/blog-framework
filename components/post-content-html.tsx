"use client";

import { useEffect, useRef } from "react";

type PostContentHtmlProps = {
  html: string;
};

let mermaidConfigured = false;
let mermaidRenderSequence = 0;

async function renderMermaid(container: HTMLElement) {
  const diagrams = Array.from(container.querySelectorAll<HTMLElement>(".mermaid"));

  if (diagrams.length === 0) {
    return;
  }

  const { default: mermaid } = await import("mermaid");

  if (!mermaidConfigured) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral"
    });
    mermaidConfigured = true;
  }

  for (const diagram of diagrams) {
    if (diagram.dataset.mermaidRendered === "true" || diagram.querySelector("svg")) {
      continue;
    }

    const source = diagram.textContent?.trim();

    if (!source) {
      continue;
    }

    const renderId = `mermaid-diagram-${++mermaidRenderSequence}`;
    const { svg, bindFunctions } = await mermaid.render(renderId, source);

    diagram.innerHTML = svg;
    diagram.dataset.mermaidRendered = "true";
    bindFunctions?.(diagram);
  }
}

export function PostContentHtml({ html }: PostContentHtmlProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    void renderMermaid(container).catch((error) => {
      console.error("Failed to render Mermaid diagrams", error);
    });
  }, [html]);

  return <div className="article-prose" dangerouslySetInnerHTML={{ __html: html }} ref={containerRef} />;
}
