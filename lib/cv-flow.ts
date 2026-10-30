import type { PdfBlock } from "./pdf-layout";

export const escapeWordXml = (text: string) => text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]!));
export type FlowGraphic = { top: number; left: number; width: number; height: number; color?: string; relationship?: string; id: number };

/** Native paragraphs and auto-height table rows, with no page-relative text boxes. */
export function flowPage(blocks: PdfBlock[], graphics: FlowGraphic[], width: number, height: number, margin: number) {
  const available = width - margin * 2;
  const bulletBlocks = new Set<PdfBlock>();
  graphics = graphics.filter(graphic => {
    if (graphic.color || graphic.width > 8 || graphic.height > 8) return true;
    const block = blocks.find(block => graphic.left < block.layout!.left && block.layout!.left - graphic.left < 24
      && height - block.layout!.baseline - graphic.top >= 0 && height - block.layout!.baseline - graphic.top < block.layout!.size);
    if (!block) return true;
    bulletBlocks.add(block); return false;
  });
  const paragraph = (block: PdfBlock, inCell = false) => {
    const l = block.layout!;
    const size = Math.max(6, Math.min(72, l.size));
    const heading = block.kind === "title" || block.kind === "heading";
    const center = height - l.baseline < height * .18 && ["title", "metadata", "subheading"].includes(block.kind)
      && Math.abs((l.left + l.right) / 2 - width / 2) < 8;
    const rawFont = l.font.replace(/^[A-Z]{6}\+/, "");
    const font = /^Arial/i.test(rawFont) ? "Arial" : /^TimesNewRoman/i.test(rawFont) ? "Times New Roman"
      : rawFont.replace(/[-,]?(Bold|Italic|Regular|Semibold|BoldItalic).*$/i, "").replace(/PSMT$|MT$/i, "") || "Arial";
    const bullet = bulletBlocks.has(block) || /^[•●▪◦·]\s*/.test(block.text);
    const text = bulletBlocks.has(block) && !/^[•●▪◦·]/.test(block.text) ? `• ${block.text}` : block.text;
    const indent = inCell || center ? 0 : Math.max(0, Math.min(36, l.left - margin));
    return `<w:p><w:pPr>${heading ? `<w:pStyle w:val="${block.kind === "title" ? "Title" : "Heading1"}"/>` : ""}<w:widowControl/>${heading || l.bold ? "<w:keepNext/>" : ""}<w:jc w:val="${center && !inCell ? "center" : "left"}"/><w:spacing w:before="${heading ? 180 : 0}" w:after="${heading ? 60 : 80}" w:line="240" w:lineRule="auto"/><w:ind w:left="${Math.round((indent + (bullet ? 10 : 0)) * 20)}"${bullet ? ' w:hanging="200"' : ""}/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${escapeWordXml(font)}" w:hAnsi="${escapeWordXml(font)}"/><w:sz w:val="${Math.round(size * 2)}"/><w:color w:val="${l.color}"/>${l.bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${escapeWordXml(text)}</w:t></w:r></w:p>`;
  };
  const entries = [
    ...blocks.map(block => ({ top: height - block.layout!.baseline - block.layout!.size, left: block.layout!.left, block })),
    ...graphics.map(graphic => ({ top: graphic.top, left: graphic.left, graphic })),
  ].sort((a, b) => a.top - b.top || a.left - b.left);
  const result: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if ("graphic" in entry) {
      const g = entry.graphic;
      if (g.color) {
        // A paragraph border follows the heading when text above it grows.
        const border = `<w:pBdr><w:bottom w:val="single" w:sz="${Math.max(4, Math.min(16, Math.round(g.height * 8)))}" w:space="2" w:color="${g.color}"/></w:pBdr>`;
        if (result.length && result.at(-1)!.endsWith("</w:p>")) result[result.length - 1] = result.at(-1)!.replace("</w:pPr>", `${border}</w:pPr>`);
        else result.push(`<w:p><w:pPr>${border}<w:spacing w:after="60"/></w:pPr></w:p>`);
      } else {
        const scale = Math.min(1, available / g.width, (height - margin * 2 - 16) / g.height);
        const displayWidth = g.width * scale, displayHeight = g.height * scale;
        const cx = Math.round(displayWidth * 12700), cy = Math.round(displayHeight * 12700);
        result.push(`<w:p><w:pPr><w:spacing w:after="80"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${g.id}" name="Illustration ${g.id}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${g.id}" name="Illustration ${g.id}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${g.relationship}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`);
      }
      continue;
    }
    const row = [entry.block];
    // Same-baseline columns (for example employer + year) must grow together.
    while (i + 1 < entries.length && "block" in entries[i + 1]) {
      const next = entries[i + 1] as typeof entry;
      if (Math.abs(next.block.layout!.baseline - entry.block.layout!.baseline) > 5) break;
      row.push(next.block); i++;
    }
    if (row.length === 1) result.push(paragraph(row[0]));
    else {
      row.sort((a, b) => a.layout!.left - b.layout!.left);
      const widths = row.map((block, index) => Math.max(1, (row[index + 1]?.layout!.left ?? width - margin) - Math.max(margin, block.layout!.left)));
      const lastWidth = Math.min(available * .35, Math.max(widths.at(-1)!, row.at(-1)!.layout!.right - row.at(-1)!.layout!.left + 14, 65));
      widths[0] = Math.max(available * .4, widths[0] - (lastWidth - widths.at(-1)!)); widths[widths.length - 1] = lastWidth;
      const total = widths.reduce((a, b) => a + b, 0);
      const twips = widths.map(value => Math.round(value / total * available * 20));
      result.push(`<w:tbl><w:tblPr><w:tblW w:w="${Math.round(available * 20)}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${twips.map(value => `<w:gridCol w:w="${value}"/>`).join("")}</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${row.map((block, index) => `<w:tc><w:tcPr><w:tcW w:w="${twips[index]}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>${paragraph(block, true)}</w:tc>`).join("")}</w:tr></w:tbl>`);
    }
  }
  return result.join("");
}
