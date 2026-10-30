import { strFromU8, unzipSync } from "fflate";
const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const V = "urn:schemas-microsoft-com:vml";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const all = (node: Element, ns: string, tag: string) => Array.from(node.getElementsByTagNameNS(ns, tag));
const val = (node: Element, tag: string, fallback = "") => all(node, W, tag)[0]?.getAttributeNS(W, "val") ?? fallback;

/** The app's converted PDFs use page-anchored VML, which generic DOCX renderers cannot position reliably. */
export function renderConvertedDocx(bytes: Uint8Array, host: HTMLElement): boolean {
  let expanded = 0;
  const files = unzipSync(bytes, { filter: file => {
    expanded += file.originalSize;
    if (expanded > 40 * 1024 * 1024) throw new Error("DOCX terlalu besar untuk pratinjau.");
    return true;
  } });
  const parse = (bytes: Uint8Array) => new DOMParser().parseFromString(strFromU8(bytes), "application/xml");
  const doc = parse(files["word/document.xml"]);
  const rects = Array.from(doc.getElementsByTagNameNS(V, "rect"));
  if (!rects.some(node => /^background\d+$/.test(node.getAttribute("id") ?? ""))) return false;
  const rels = parse(files["word/_rels/document.xml.rels"]);
  const targets = new Map(Array.from(rels.documentElement.children).map(node => [node.getAttribute("Id"), node.getAttribute("Target")]));
  let page: HTMLElement | undefined;
  for (const rect of rects) {
    const id = rect.getAttribute("id") ?? "";
    const geometry = new Map((rect.getAttribute("style") ?? "").split(";").map(part => part.split(":").map(s => s.trim()) as [string, string]));
    const pt = (key: string) => {
      const value = geometry.get(key) ?? "0pt";
      return `${/^-?[\d.]+pt$/.test(value) ? Math.max(0, Math.min(2000, parseFloat(value))) : 0}pt`;
    };
    if (/^background\d+$/.test(id)) {
      page = document.createElement("section");
      Object.assign(page.style, { position: "relative", width: pt("width"), height: pt("height"), background: "white", color: "#202020", marginBottom: "16px", overflow: "hidden" });
      const relation = all(rect, V, "imagedata")[0]?.getAttributeNS(R, "id");
      const target = relation && targets.get(relation);
      const image = target && files[`word/${target}`];
      if (image && /\.png$/i.test(target!)) {
        const img = document.createElement("img");
        let binary = "";
        for (let i = 0; i < image.length; i += 8192) binary += String.fromCharCode(...image.subarray(i, i + 8192));
        img.src = `data:image/png;base64,${btoa(binary)}`;
        img.alt = "";
        Object.assign(img.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
        page.append(img);
      }
      host.append(page);
    } else if (page && /^text\d+$/.test(id)) {
      const box = document.createElement("div");
      Object.assign(box.style, { position: "absolute", left: pt("margin-left"), top: pt("margin-top"), width: pt("width"), minHeight: pt("height") });
      for (const paragraph of all(rect, W, "p")) {
        const p = document.createElement("p");
        const align = val(paragraph, "jc", "left");
        Object.assign(p.style, { margin: "0", whiteSpace: "pre-wrap", textAlign: ["left", "center", "right", "justify"].includes(align) ? align : "left", lineHeight: `${Number(all(paragraph, W, "spacing")[0]?.getAttributeNS(W, "line") ?? 240) / 20}pt` });
        for (const run of all(paragraph, W, "r")) {
          const span = document.createElement("span");
          span.textContent = all(run, W, "t").map(node => node.textContent).join("");
          const color = val(run, "color", "202020");
          Object.assign(span.style, { fontFamily: all(run, W, "rFonts")[0]?.getAttributeNS(W, "ascii") || "Arial", fontSize: `${Math.max(1, Math.min(144, Number(val(run, "sz", "22")) / 2))}pt`, color: /^[\da-f]{6}$/i.test(color) ? `#${color}` : "#202020", fontWeight: all(run, W, "b").some(node => !["0", "false"].includes(node.getAttributeNS(W, "val") ?? "")) ? "bold" : "normal", fontStyle: all(run, W, "i").length ? "italic" : "normal" });
          p.append(span);
        }
        box.append(p);
      }
      page.append(box);
    }
  }
  return true;
}
