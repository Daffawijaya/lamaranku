import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { DOMParser, XMLSerializer, type Element } from "@xmldom/xmldom";
import { preservesConfirmedFacts, type CvAnswer } from "./cv-clarifications";

const WORD = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const STRICT_WORD = "http://purl.oclc.org/ooxml/wordprocessingml/main";
const MAIN = "word/document.xml";
const MAX_BYTES = 10 * 1024 * 1024;
const serializer = new XMLSerializer();
export type SkippedCvRevision = { id: string; before: string; after: string; reasons: ("facts" | "length")[] };
const xml = (value: Uint8Array) => {
  const source = strFromU8(value);
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error("DOCX berisi XML yang tidak didukung.");
  return new DOMParser({ onError: () => { throw new Error("XML DOCX rusak."); } }).parseFromString(source, "application/xml");
};
const descendants = (element: Element, name: string) => Array.from(element.getElementsByTagNameNS(element.namespaceURI!, name));

/** Edit only plain paragraphs with uniform run formatting; keep package assets intact. */
export function openRepairDocx(data: Uint8Array) {
  if (!data.length || data.length > MAX_BYTES) throw new Error("Gunakan DOCX maksimal 10 MB.");
  let expanded = 0, entries = 0;
  const names = new Set<string>();
  const files = unzipSync(data, { filter: file => {
    expanded += file.originalSize;
    if (++entries > 2000 || expanded > 40 * 1024 * 1024 || names.has(file.name)) throw new Error("DOCX terlalu besar atau kompleks.");
    names.add(file.name);
    if (/vbaProject|^_xmlsignatures\//i.test(file.name)) throw new Error("Gunakan DOCX tanpa makro atau tanda tangan digital.");
    return true;
  } });
  if (!files[MAIN] || !files["[Content_Types].xml"] || !files["_rels/.rels"]) throw new Error("Berkas bukan dokumen DOCX yang valid.");
  const types = strFromU8(files["[Content_Types].xml"]);
  if (!types.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml")) throw new Error("Gunakan dokumen Word berformat DOCX.");
  const document = xml(files[MAIN]);
  const root = document.documentElement;
  if (!root || root.localName !== "document" || ![WORD, STRICT_WORD].includes(root.namespaceURI!)) throw new Error("Isi DOCX tidak valid.");
  const namespace = root.namespaceURI!;
  const segments: { id: string; text: string }[] = [];
  const editable = new Map<string, { text: string; nodes: Element[] }>();
  let total = 0;
  const parts = [MAIN, ...Object.keys(files).filter(name => /^word\/(header|footer)\d+\.xml$/.test(name)).sort()];
  for (const [partIndex, name] of parts.entries()) {
    const part = name === MAIN ? document : xml(files[name]);
    for (const [index, paragraph] of Array.from(part.getElementsByTagNameNS(namespace, "p")).entries()) {
      // Text boxes have their own paragraphs; do not count them again in their outer paragraph.
      if (descendants(paragraph, "p").length) continue;
      const nodes = descendants(paragraph, "t").filter(node => {
        for (let parent = node.parentNode; parent && parent !== paragraph; parent = parent.parentNode) {
          if (parent.namespaceURI === namespace && ["del", "moveFrom"].includes(parent.localName ?? "")) return false;
        }
        return true;
      });
      const visibleText = (element: Element): string => {
        if (element.namespaceURI === namespace) {
          if (["del", "moveFrom"].includes(element.localName ?? "")) return "";
          if (element.localName === "t") return element.textContent ?? "";
          if (["tab", "br", "cr"].includes(element.localName ?? "")) return " ";
        }
        return Array.from(element.childNodes).filter(child => child.nodeType === 1).map(child => visibleText(child as Element)).join("");
      };
      const text = visibleText(paragraph);
      if (!text.trim()) continue;
      total += text.length;
      if (total > 80_000 || segments.length >= 2000) throw new Error("Teks DOCX terlalu panjang untuk review.");
      const id = `D${partIndex}P${index}`;
      segments.push({ id, text });
      const style = descendants(paragraph, "pStyle")[0]?.getAttributeNS(namespace, "val") ?? "";
      const complex = ["drawing", "pict", "tab", "br", "cr", "fldChar", "instrText", "hyperlink", "sdt", "ins", "del", "moveFrom", "moveTo", "bookmarkStart", "commentRangeStart", "footnoteReference", "endnoteReference"];
      const formats = new Set(nodes.map(node => {
        const run = node.parentNode as Element;
        return Array.from(run.childNodes).filter(child => child.nodeType === 1 && child.localName === "rPr").map(child => serializer.serializeToString(child)).join("");
      }));
      if (name === MAIN && text.length >= 20 && text.length <= 2000 && text.trim().split(/\s+/).length >= 4
        && !/title|heading|subtitle/i.test(style) && !/https?:|www\.|\S+@\S+/i.test(text)
        && formats.size === 1 && !complex.some(tag => descendants(paragraph, tag).length)
        && nodes.every(node => node.parentNode?.localName === "r" && node.parentNode.parentNode === paragraph)) {
        editable.set(id, { text, nodes });
      }
    }
  }
  if (!segments.length) throw new Error("DOCX tidak memiliki teks yang dapat dibaca.");
  let closed = false;
  return {
    segments,
    editableIds: [...editable.keys()],
    text: segments.map(s => s.text).join("\n"),
    close() { closed = true; },
    apply(value: unknown, confirmations: CvAnswer[] = [], approvedIds: string[] = []) {
      if (closed) throw new Error("Dokumen sudah ditutup.");
      if (!Array.isArray(value) || value.length > editable.size) throw new Error("Revisi AI tidak valid.");
      const seen = new Set<string>();
      const accepted: { original: { text: string; nodes: Element[] }; text: string }[] = [];
      const skippedDetails: SkippedCvRevision[] = [];
      for (const revision of value) {
        if (!revision || typeof revision.id !== "string" || typeof revision.text !== "string" || seen.has(revision.id)) throw new Error("Revisi AI tidak valid.");
        seen.add(revision.id);
        const original = editable.get(revision.id);
        const text = revision.text.trim();
        if (!original || !text || text.length > 2000 || /[\u0000-\u001f\u007f]/.test(text)) throw new Error("Revisi AI tidak sesuai paragraf DOCX.");
        if (original.text === text) continue;
        const confirmed = confirmations.filter(answer => answer.segmentId === revision.id).map(answer => answer.answer);
        const reasons: SkippedCvRevision["reasons"] = [];
        if (!approvedIds.includes(revision.id) && !preservesConfirmedFacts(original.text, text, confirmed)) reasons.push("facts");
        if (reasons.length) { skippedDetails.push({ id: revision.id, before: original.text, after: text, reasons }); continue; }
        accepted.push({ original, text });
      }
      if (!accepted.length) throw Object.assign(new Error("Belum ada revisi yang aman diterapkan pada DOCX. Coba lagi atau terapkan saran review di dokumen sumber."), { skippedDetails });
      for (const { original, text } of accepted) {
        let offset = 0;
        original.nodes.forEach((node, index) => {
          const length = index === original.nodes.length - 1 ? text.length - offset : Math.min(node.textContent?.length ?? 0, text.length - offset);
          node.textContent = text.slice(offset, offset + length);
          node.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
          offset += length;
        });
      }
      files[MAIN] = strToU8(serializer.serializeToString(document));
      return { bytes: zipSync(files), applied: accepted.map(({ original, text }) => ({ before: original.text, after: text })), skipped: skippedDetails.length, skippedDetails };
    },
  };
}
