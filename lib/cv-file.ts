export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const CV_ACCEPT = `application/pdf,.pdf,${DOCX_MIME},.docx`;
export function isDocx(file: { name: string; type: string }) {
  return /\.docx$/i.test(file.name) || file.type === DOCX_MIME;
}
