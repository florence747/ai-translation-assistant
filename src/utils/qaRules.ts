import type { IssueSeverity, IssueType, ProjectSettings, QAIssue, TermItem } from "../types";
import { splitParagraphs } from "./textStats";

const residueWhitelist = new Set([
  "AI",
  "API",
  "QA",
  "UI",
  "CAT",
  "URL",
  "HTML",
  "CSS",
  "CSV",
  "JSON",
  "XML",
  "PDF",
  "OCR",
  "GPT",
  "DEEPL",
  "CROWDIN",
  "MICROSOFT",
  "TMX",
  "XLIFF",
  "HTTP",
  "HTTPS"
]);

const styleChecklist: Record<ProjectSettings["textType"], string[]> = {
  technical: ["术语是否统一", "句子是否准确简洁", "数字和单位是否正确", "操作步骤是否清楚"],
  website: ["译文是否自然", "是否过度直译", "是否符合中文用户阅读习惯", "是否保留宣传效果"],
  product: ["功能描述是否准确", "卖点是否清楚", "术语是否统一", "信息是否完整"],
  "app-ui": ["是否足够简短", "是否适合作为按钮或菜单", "是否避免解释过多"],
  academic: ["表达是否正式", "逻辑关系是否清楚", "术语是否规范", "是否避免口语化"],
  general: ["准确性", "完整性", "自然度", "术语一致性", "数字专名保留"]
};

function createIssue(severity: IssueSeverity, type: IssueType, description: string, suggestion: string, paragraphIndex?: number): QAIssue {
  return {
    id: type + "-" + severity + "-" + Math.random().toString(36).slice(2, 9),
    severity,
    type,
    description,
    suggestion,
    status: "pending",
    paragraphIndex
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");
}

function includesLoose(text: string, term: string) {
  if (!term.trim()) return false;
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  if (/^[A-Za-z][A-Za-z\s-]*$/.test(term)) {
    const pattern = new RegExp("\\b" + escapeRegExp(lowerTerm) + "s?\\b", "i");
    return pattern.test(lowerText);
  }
  return lowerText.includes(lowerTerm);
}

function paragraphWith(text: string, needle: string) {
  return splitParagraphs(text).findIndex((paragraph) => includesLoose(paragraph, needle));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractNumbers(text: string) {
  const patterns = [
    /\bv?\d+(?:\.\d+){1,3}\b/gi,
    /\b\d+(?:\.\d+)?%/g,
    /\b\d+\s*percent\b/gi,
    /\b(?:19|20)\d{2}(?:[-/.]\d{1,2}){0,2}\b/g,
    /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g
  ];
  const tokens = unique(patterns.flatMap((pattern) => text.match(pattern) ?? []));
  return tokens.filter((token) => !tokens.some((other) => other !== token && other.includes(token)));
}

function extractProperTokens(text: string) {
  const urls = text.match(/https?:\/\/[^\s)]+/g) ?? [];
  const emails = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const acronyms = text.match(/\b[A-Z]{2,}\b/g) ?? [];
  const symbolNames = text.match(/\b[A-Za-z]+(?:-[A-Za-z0-9]+)+\b/g) ?? [];
  const knownNames = text.match(/\b(?:DeepL|Crowdin|Microsoft|GPT-\d+(?:\.\d+)?|TMX|XLIFF)\b/g) ?? [];
  const capitalized = text.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)?\b/g) ?? [];
  const ignored = new Set(["The", "With", "This", "That", "These", "Those", "A", "An", "Version"]);
  return unique([...urls, ...emails, ...acronyms, ...symbolNames, ...knownNames, ...capitalized]).filter((item) => !ignored.has(item));
}

function extractEnglishResidue(text: string) {
  return unique(text.match(/[A-Za-z]{2,}(?:-[A-Za-z0-9]+)*/g) ?? []);
}

function isAllowedEnglishResidue(token: string, terms: TermItem[]) {
  const upper = token.toUpperCase();
  const normalized = upper.replace(/-\d+(?:\.\d+)?$/, "");
  if (residueWhitelist.has(upper) || residueWhitelist.has(normalized)) return true;
  return terms.some((term) => {
    const allowed = [term.sourceTerm, term.approvedTranslation].filter(Boolean);
    return allowed.some((item) => includesLoose(item, token) || includesLoose(token, item));
  });
}

export function getStyleChecklist(textType: ProjectSettings["textType"]) {
  return styleChecklist[textType];
}

export function runQAChecks(settings: ProjectSettings, sourceText: string, translationText: string, terms: TermItem[]) {
  const issues: QAIssue[] = [];
  const sourceParagraphs = splitParagraphs(sourceText);
  const translationParagraphs = splitParagraphs(translationText);

  if (sourceParagraphs.length !== translationParagraphs.length) {
    issues.push(createIssue("medium", "paragraph", "原文 " + sourceParagraphs.length + " 段，译文 " + translationParagraphs.length + " 段，段落结构可能不一致。", "请检查原文与译文段落是否逐段对应。"));
  }

  terms.forEach((term) => {
    if (!term.sourceTerm.trim() || !includesLoose(sourceText, term.sourceTerm)) return;
    const forbiddenFound = term.forbiddenTranslations.filter((item) => item && translationText.includes(item));
    const translationWithoutForbidden = forbiddenFound.reduce((text, item) => text.split(item).join(""), translationText);
    const approvedFound = term.approvedTranslation ? translationWithoutForbidden.includes(term.approvedTranslation) : false;
    const paraIndex = forbiddenFound[0] ? paragraphWith(translationText, forbiddenFound[0]) : paragraphWith(sourceText, term.sourceTerm);

    if (approvedFound && forbiddenFound.length > 0) {
      issues.push(createIssue("high", "term", "术语“" + term.sourceTerm + "”同时出现指定译名“" + term.approvedTranslation + "”和禁用译名“" + forbiddenFound.join("、") + "”。", "请统一为“" + term.approvedTranslation + "”。", paraIndex));
      return;
    }

    if (forbiddenFound.length > 0) {
      issues.push(createIssue("high", "term", "术语“" + term.sourceTerm + "”出现禁用译名“" + forbiddenFound.join("、") + "”。", "建议替换为指定译名“" + term.approvedTranslation + "”。", paraIndex));
    }

    if (term.approvedTranslation && !approvedFound) {
      issues.push(createIssue("medium", "term", "术语“" + term.sourceTerm + "”未检测到指定译名“" + term.approvedTranslation + "”。", "请确认是否漏译，或是否使用了项目不一致的译法。", paraIndex));
    }
  });

  extractNumbers(sourceText).forEach((token) => {
    const numericPart = token.match(/\d+(?:\.\d+)?/)?.[0] ?? token;
    if (!translationText.includes(token) && !translationText.includes(numericPart)) {
      issues.push(createIssue("high", "number", "原文数字、日期或版本号“" + token + "”未在译文中检测到。", "请确认数字是否遗漏或被错误改写。", paragraphWith(sourceText, token)));
    }
  });

  extractProperTokens(sourceText).forEach((token) => {
    if (!translationText.includes(token)) {
      issues.push(createIssue("medium", "proper-noun", "原文专名或缩写“" + token + "”未在译文中保留。", "请人工确认该专名、缩写、URL 或邮箱是否需要保留或采用固定译名。", paragraphWith(sourceText, token)));
    }
  });

  if (settings.direction === "en-zh") {
    extractEnglishResidue(translationText).forEach((token) => {
      if (!isAllowedEnglishResidue(token, terms)) {
        issues.push(createIssue("medium", "english-residue", "译文中检测到英文片段“" + token + "”，疑似未翻译。", "请确认该英文是否需要翻译，或是否属于允许保留的缩写、URL、邮箱或术语。", paragraphWith(translationText, token)));
      }
    });
  }

  return issues;
}
