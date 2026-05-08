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
      securityLevel: "loose",
      themeVariables: {
        fontFamily: 'var(--font-ui)',
        fontSize: '15px',
        primaryColor: '#f7f3eb',
        primaryTextColor: '#1f1f1a',
        primaryBorderColor: '#c8bca8',
        secondaryColor: '#fcfaf5',
        secondaryTextColor: '#1f1f1a',
        secondaryBorderColor: '#d9cfbb',
        tertiaryColor: '#f2ede3',
        tertiaryTextColor: '#1f1f1a',
        tertiaryBorderColor: '#d3c7b3',
        lineColor: '#857968',
        edgeLabelBackground: '#fffdf9',
        clusterBkg: '#f8f4ec',
        clusterBorder: '#d4c8b5',
        titleColor: '#1f1f1a',
        mainBkg: '#f7f3eb',
        textColor: '#1f1f1a',
        nodeBorder: '#c8bca8',
        actorBorder: '#c8bca8',
        actorBkg: '#f7f3eb',
        actorTextColor: '#1f1f1a',
        labelBoxBkgColor: '#fffaf3',
        labelBoxBorderColor: '#d9cfbb',
        noteBkgColor: '#fffaf3',
        noteBorderColor: '#d9cfbb',
        noteTextColor: '#494338',
        activationBorderColor: '#c8bca8',
        activationBkgColor: '#fcfaf5',
        activationTextColor: '#1f1f1a',
        signalColor: '#6e6557',
        signalTextColor: '#3e382f',
        sequenceNumberColor: '#6e6557',
        cScale0: '#f7f3eb',
        cScale1: '#fcfaf5',
        cScale2: '#f2ede3'
      },
      flowchart: {
        curve: 'basis',
        useMaxWidth: true,
        htmlLabels: false,
        padding: 12,
        nodeSpacing: 38,
        rankSpacing: 48,
        wrappingWidth: 240
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        diagramMarginX: 18,
        diagramMarginY: 20,
        actorMargin: 42,
        messageMargin: 30,
        width: 180
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
