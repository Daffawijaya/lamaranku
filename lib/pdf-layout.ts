export type PdfCharacter = {
  text: string; left: number; right: number; baseline: number; size: number; bold: boolean;
  top?: number; bottom?: number; font?: string; color?: string;
};
export type PdfBlock = {
  id: string; text: string; kind: "title" | "heading" | "subheading" | "metadata" | "paragraph" | "bullet";
  layout?: { left: number; right: number; top: number; bottom: number; baseline: number; size: number; bold: boolean; font: string; color: string; lineHeight: number };
};

/** Content-stream order is not reading order. Build lines from their page coordinates. */
export function pdfReadingOrder(chars: PdfCharacter[], page: number, pageWidth: number, splitColumns = false): PdfBlock[] {
  const lines: { baseline: number; chars: PdfCharacter[] }[] = [];
  for (const char of [...chars].sort((a, b) => b.baseline - a.baseline || a.left - b.left)) {
    if (!Number.isFinite(char.baseline) || !Number.isFinite(char.left)) continue;
    const line = lines.find(line => Math.abs(line.baseline - char.baseline) < 1.6);
    if (line) line.chars.push(char);
    else lines.push({ baseline: char.baseline, chars: [char] });
  }
  const separated = splitColumns ? lines.flatMap(line => {
    const groups: typeof lines = [];
    let previous: PdfCharacter | undefined;
    for (const char of line.chars.sort((a, b) => a.left - b.left)) {
      if (!char.text.trim() && char.right - char.left > char.size * 3) continue;
      if (!groups.length || previous && char.left - previous.right > Math.max(char.size * 3, pageWidth * .06)) groups.push({ baseline: line.baseline, chars: [] });
      groups[groups.length - 1].chars.push(char);
      if (char.text.trim()) previous = char;
    }
    return groups;
  }) : lines;
  const visual = separated.sort((a, b) => b.baseline - a.baseline || a.chars[0].left - b.chars[0].left).map(line => {
    const ordered = line.chars.sort((a, b) => a.left - b.left);
    let text = "", previous: PdfCharacter | undefined;
    for (const char of ordered) {
      if (previous && char.text === previous.text && Math.abs(char.left - previous.left) < .1) continue;
      if (previous && char.left - previous.right > pageWidth * .12) text += " | ";
      text += char.text;
      previous = char;
    }
    const visible = ordered.filter(c => c.text.trim());
    return { text: text.replace(/\s+/g, " ").trim(), baseline: line.baseline,
      left: visible[0]?.left ?? 0, size: Math.max(...visible.map(c => c.size), 1),
      right: Math.max(...visible.map(c => c.right), 0),
      top: Math.max(...visible.map(c => c.top ?? c.baseline + c.size * .8), 0),
      bottom: Math.min(...visible.map(c => c.bottom ?? c.baseline - c.size * .2)),
      font: visible[0]?.font ?? "Arial", color: visible[0]?.color ?? "202020",
      bold: visible.filter(c => c.bold).length > visible.length * .55 };
  }).filter(line => line.text);
  const margin = Math.min(...visual.map(line => line.left));
  const regularSizes = chars.filter(char => !char.bold && char.text.trim()).map(char => char.size).sort((a, b) => a - b);
  const bodySize = regularSizes[Math.floor(regularSizes.length / 2)] ?? 10;
  const blocks: (PdfBlock & { baseline: number; size: number; left: number })[] = [];
  for (const [index, line] of visual.entries()) {
    const previous = blocks[blocks.length - 1];
    const upper = /[A-Z]/.test(line.text) && line.text === line.text.toUpperCase();
    const heading = upper && line.text.length < 55 && !/[\d|@]/.test(line.text) && line.size >= bodySize * 1.12;
    const metadata = /https?:|www\.|\S+@\S+|^[\w &/]+:|^\d{4}(?:\s|$)|\|\s*\d{4}$/i.test(line.text);
    const explicitBullet = /^[•●▪◦‣]\s*/.test(line.text);
    const continues = previous && (["paragraph", "bullet"].includes(previous.kind)
      || previous.kind === "metadata" && /^[\w &/]+:/.test(previous.text)
      || previous.kind === "subheading" && previous.text.endsWith(","))
      && !/[.!?:;]$/.test(previous.text) && !heading && !metadata
      && (!line.bold || previous.kind === "subheading" && previous.text.endsWith(",")) && !explicitBullet
      && previous.baseline - line.baseline < Math.max(previous.size, line.size) * 1.4
      && Math.abs(previous.left - line.left) < 8;
    if (continues && previous.text.length + line.text.length < 2000) {
      previous.text += (previous.text.endsWith("-") ? "" : " ") + line.text;
      previous.layout!.right = Math.max(previous.layout!.right, line.right);
      previous.layout!.bottom = Math.min(previous.layout!.bottom, line.bottom);
      previous.layout!.lineHeight = Math.max(previous.layout!.lineHeight, previous.baseline - line.baseline);
      previous.baseline = line.baseline;
      continue;
    }
    const kind: PdfBlock["kind"] = page === 0 && index === 0 ? "title"
      : heading ? "heading" : line.bold ? "subheading" : metadata ? "metadata"
      : page === 0 && index < 5 && line.text.length < 60 && !/[.!?]$/.test(line.text) ? "metadata"
      : line.text.length < 45 && !/[.!?\-]$/.test(line.text) ? "metadata"
      : explicitBullet || line.left > margin + 9 ? "bullet" : "paragraph";
    blocks.push({ id: `P${page + 1}B${blocks.length + 1}`, text: splitColumns ? line.text : line.text.replace(/^[•●▪◦‣]\s*/, ""), kind, baseline: line.baseline, size: line.size, left: line.left,
      layout: { left: line.left, right: line.right, top: line.top, bottom: line.bottom, baseline: line.baseline, size: line.size, bold: line.bold, font: line.font, color: line.color, lineHeight: line.size * 1.15 } });
  }
  return blocks.map(({ id, text, kind, layout }) => ({ id, text, kind, layout }));
}
