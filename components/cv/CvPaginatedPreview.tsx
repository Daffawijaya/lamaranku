"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CvData } from "../../lib/cv";
import CvSheet from "./CvSheet";
import "./cv-pagination.css";

export function CvPaginatedPreview({ data, watermark }: { data: CvData; watermark: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const current = Math.min(page, pages - 1);

  useLayoutEffect(() => {
    const container = host.current;
    const sheet = paper.current;
    const content = flow.current;
    if (!container || !sheet || !content) return;
    let disposed = false;
    const measure = () => {
      if (disposed || !container.clientWidth || !sheet.offsetWidth || !content.clientWidth) return;
      setScale(Math.min(1, container.clientWidth / sheet.offsetWidth));
      // DOM widths round to whole pixels; allow for a one-pixel rounding difference.
      const count = Math.max(1, Math.ceil((content.scrollWidth - 1) / content.clientWidth));
      setPages(count);
      setPage(previous => Math.min(previous, count - 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      disposed = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [data]);

  return (
    <div className="cv-a4-preview">
      <div ref={host} className="cv-a4-host" style={{ height: `calc(297mm * ${scale})` }}>
        <div ref={paper} className="cv-a4-paper" style={{ transform: `scale(${scale})` }}>
          <div className="cv-a4-window" role="region" aria-label={`Pratinjau CV, halaman ${current + 1} dari ${pages}`}>
            <div ref={flow} className="cv-a4-flow" style={{ transform: `translateX(-${current * 210}mm)` }}>
              <CvSheet data={data} watermark={false} id="cv-sheet" />
            </div>
            {watermark && (
              <div className="cv-a4-watermark" aria-hidden="true">
                <span>LAMARANKU BASIC</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="cv-a4-pagination no-print" aria-label="Navigasi halaman CV">
        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Halaman sebelumnya">
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        <span role="status" aria-live="polite">Halaman {current + 1} dari {pages}</span>
        <button type="button" disabled={current === pages - 1} onClick={() => setPage(current + 1)} aria-label="Halaman berikutnya">
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
