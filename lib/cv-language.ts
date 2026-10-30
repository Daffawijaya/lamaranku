type CvLanguage = "en" | "id";
const english = new Set("the and with for of to in from using through developed built implemented supported managed designed experience independently maintained responsible experienced development building managing".split(" "));
const indonesian = new Set("dan dengan untuk dari yang dalam pada sebagai melalui menggunakan mengembangkan membangun mendukung mengelola merancang pengalaman melakukan meningkatkan berpengalaman menginisiasi bertanggung pengembangan pengelolaan".split(" "));
/** Conservative hints only: proper names, skills, and other languages remain undetermined. */
export function cvLanguageHint(text: string): CvLanguage | null {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const en = words.filter(word => english.has(word)).length;
  const id = words.filter(word => indonesian.has(word)).length;
  if (en >= 3 && en >= id * 2) return "en";
  if (id >= 3 && id >= en * 2) return "id";
  return null;
}
export function translatedCvIds(revisions: { id: string; text: string }[], originals: { id: string; text: string }[]) {
  const documentLanguage = cvLanguageHint(originals.map(item => item.text).join(" "));
  return revisions.filter(revision => {
    const original = originals.find(item => item.id === revision.id);
    if (!original || original.text === revision.text) return false;
    const expected = cvLanguageHint(original.text) ?? documentLanguage;
    const actual = cvLanguageHint(revision.text);
    return expected && actual && expected !== actual;
  }).map(item => item.id);
}
