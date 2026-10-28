"use client";

import { useEffect, useRef, useState } from "react";
import { PROFESSIONAL_EXAMPLE } from "../../data/professional-example";
import CvSheet from "./CvSheet";

export function ProfessionalPreview() {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.166);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const measure = () => setScale(element.clientWidth / (210 * 96 / 25.4));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className="professional-preview">
    <div className="professional-preview-paper" style={{ transform: `scale(${scale})` }}>
      <CvSheet data={PROFESSIONAL_EXAMPLE} watermark={false} />
    </div>
  </div>;
}
