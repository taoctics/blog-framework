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
      theme: "base",
      themeVariables: {
        fontFamily: 'var(--font-ui)',
        fontSize: '15px',
        primaryColor: '#f6f1e8',
        primaryTextColor: '#1f1f1a',
        primaryBorderColor: '#c9bda8',
        secondaryColor: '#fbf8f2',
        secondaryTextColor: '#1f1f1a',
        secondaryBorderColor: '#d8cdb8',
        tertiaryColor: '#f3efe6',
        tertiaryTextColor: '#1f1f1a',
        tertiaryBorderColor: '#d2c6b2',
        lineColor: '#8a7f6f',
        edgeLabelBackground: '#fffdf8',
        clusterBkg: '#f7f3eb',
        clusterBorder: '#d4c8b5',
        titleColor: '#1f1f1a',
        mainBkg: '#f6f1e8',
        textColor: '#1f1f1a',
        nodeBorder: '#c9bda8',
        actorBorder: '#c9bda8',
        actorBkg: '#f6f1e8',
        labelBoxBkgColor: '#fffaf2',
        labelBoxBorderColor: '#d8cdb8',
        noteBkgColor: '#fffaf2',
        noteBorderColor: '#d8cdb8',
        cScale0: '#f6f1e8',
        cScale1: '#fbf8f2',
        cScale2: '#f3efe6'
      },
      flowchart: {
        curve: 'basis',
        useMaxWidth: true,
        htmlLabels: false,
        padding: 10,
        nodeSpacing: 34,
        rankSpacing: 40
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        diagramMarginX: 14,
        diagramMarginY: 18,
        actorMargin: 36,
        messageMargin: 26
      }
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

function syncMathOverflow(container: HTMLElement) {
  const inlineMathNodes = Array.from(container.querySelectorAll<HTMLElement>(".katex")).filter(
    (node) => !node.closest(".katex-display")
  );

  for (const mathNode of inlineMathNodes) {
    mathNode.classList.remove("katex-inline-scroll");

    const contentNode = mathNode.querySelector<HTMLElement>(".katex-html") ?? mathNode;
    const parentWidth = mathNode.parentElement?.clientWidth ?? 0;
    const contentWidth = Math.ceil(contentNode.scrollWidth);
    const isOverflowing = parentWidth > 0 && contentWidth - parentWidth > 1;

    mathNode.classList.toggle("katex-inline-scroll", isOverflowing);
  }
}

export function PostContentHtml({ html }: PostContentHtmlProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let syncFrame = 0;
    let disposed = false;

    const scheduleMathSync = () => {
      if (disposed) {
        return;
      }

      window.cancelAnimationFrame(syncFrame);
      syncFrame = window.requestAnimationFrame(() => {
        syncMathOverflow(container);
      });
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            scheduleMathSync();
          });

    resizeObserver?.observe(container);
    scheduleMathSync();

    void renderMermaid(container)
      .then(() => {
        scheduleMathSync();
      })
      .catch((error) => {
        console.error("Failed to render Mermaid diagrams", error);
      });

    void document.fonts?.ready?.then(() => {
      scheduleMathSync();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(syncFrame);
      resizeObserver?.disconnect();
    };
  }, [html]);

  return <div className="article-prose" dangerouslySetInnerHTML={{ __html: html }} ref={containerRef} />;
}
