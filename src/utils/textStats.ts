export type TextStats = {
  paragraphs: number;
  words: number;
  cjkChars: number;
  chars: number;
};

export function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitParagraphs(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const separator = normalized.includes("\n\n") ? /\n{2,}/ : /\n+/;
  return normalized
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getTextStats(text: string): TextStats {
  const paragraphs = splitParagraphs(text).length;
  const words = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return {
    paragraphs,
    words,
    cjkChars,
    chars: text.length
  };
}
