import { WA_NUMBER } from "../data/features";

export function wa(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
