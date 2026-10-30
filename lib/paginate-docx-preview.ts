/** Browser approximation of Word flow. Only used for our single-section flow documents. */
export function paginateDocxPreview(container: HTMLElement) {
  const first = container.querySelector<HTMLElement>("section.docx");
  const article = first?.querySelector<HTMLElement>(":scope > article");
  if (!first || !article) return;
  const pageStyle = getComputedStyle(first);
  const height = parseFloat(pageStyle.minHeight) || parseFloat(pageStyle.height);
  const usable = height - parseFloat(pageStyle.paddingTop) - parseFloat(pageStyle.paddingBottom);
  if (!(usable > 0)) return;
  const nodes = Array.from(article.children) as HTMLElement[];
  article.replaceChildren();
  first.style.height = `${height}px`;
  first.style.minHeight = `${height}px`;
  let page = first, content = article;
  let pages = 1;
  const nextPage = () => {
    if (++pages > 250) throw new Error("Dokumen terlalu panjang untuk pratinjau.");
    const clone = first.cloneNode(false) as HTMLElement;
    const nextContent = article.cloneNode(false) as HTMLElement;
    clone.append(nextContent); page.after(clone); page = clone; content = nextContent;
  };
  const fits = () => content.getBoundingClientRect().height <= usable + .5;
  const place = (node: HTMLElement) => {
    content.append(node);
    if (fits()) return;
    if (content.children.length > 1) {
      node.remove();
      // Avoid leaving a section heading alone at the foot of the page.
      const last = content.lastElementChild as HTMLElement | null;
      const keep = last?.matches("p.docx_heading1,p.docx_title") ? last : null;
      keep?.remove(); nextPage(); if (keep) content.append(keep); content.append(node);
      if (fits()) return;
    }
    if (node.tagName === "TABLE") {
      const rows = Array.from(node.querySelectorAll<HTMLTableRowElement>(":scope > tbody > tr,:scope > tr"));
      if (rows.length > 1) {
        rows.forEach(row => row.remove());
        let table = node as HTMLTableElement;
        for (const row of rows) {
          (table.tBodies[0] ?? table).append(row);
          if (!fits() && table.rows.length > 1) {
            row.remove(); nextPage();
            table = node.cloneNode(true) as HTMLTableElement;
            Array.from(table.rows).forEach(existing => existing.remove());
            content.append(table); (table.tBodies[0] ?? table).append(row);
          }
        }
        return;
      }
    }
    if (node.tagName !== "P" || node.querySelector("img,svg,math")) return;
    // Split overflowing paragraphs at a word boundary while retaining every styled run.
    const original = node.cloneNode(true) as HTMLElement;
    const text = original.textContent ?? "";
    const boundaries = Array.from(text.matchAll(/\s+/g), match => match.index! + match[0].length);
    let low = 0, high = boundaries.length - 1, best = 0;
    const portion = (start: number, end: number) => {
      const copy = original.cloneNode(true) as HTMLElement;
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
      let offset = 0;
      while (walker.nextNode()) {
        const child = walker.currentNode;
        const value = child.textContent ?? "";
        child.textContent = value.slice(Math.max(0, start - offset), Math.max(0, end - offset)); offset += value.length;
      }
      return copy;
    };
    while (low <= high) {
      const mid = (low + high) >> 1;
      node.replaceChildren(...Array.from(portion(0, boundaries[mid]).childNodes));
      if (fits()) { best = boundaries[mid]; low = mid + 1; } else high = mid - 1;
    }
    if (!best) { node.replaceChildren(...Array.from(original.childNodes)); return; }
    node.replaceChildren(...Array.from(portion(0, best).childNodes));
    nextPage(); place(portion(best, text.length));
  };
  for (const node of nodes) place(node);
}
