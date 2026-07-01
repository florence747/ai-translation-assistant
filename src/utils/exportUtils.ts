import type { EditingRow, ProjectSettings, QAIssue, TermItem } from "../types";
import { rowsToCsv } from "./csvUtils";
import { getStyleChecklist } from "./qaRules";
import { getTextStats } from "./textStats";

export function safeFileName(value: string) {
  return (value || "AI译文质检")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadText(fileName: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob(["\ufeff", content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildFinalTranslation(rows: EditingRow[]) {
  return rows.map((row) => row.revisedTranslation || row.aiTranslation).filter(Boolean).join("\n\n");
}

export function buildEditingCsv(rows: EditingRow[]) {
  return rowsToCsv([
    ["编号", "原文", "AI 译文", "检测问题", "修改后译文", "修改说明", "状态"],
    ...rows.map((row) => [
      row.index,
      row.sourceText,
      row.aiTranslation,
      row.detectedIssues.join("；"),
      row.revisedTranslation,
      row.revisionNote,
      row.status
    ])
  ]);
}

export function buildTermCsv(terms: TermItem[]) {
  return rowsToCsv([
    ["原文术语", "指定译名", "禁用译名", "备注"],
    ...terms.map((term) => [
      term.sourceTerm,
      term.approvedTranslation,
      term.forbiddenTranslations.join("；"),
      term.note ?? ""
    ])
  ]);
}

export function buildMarkdownReport(
  settings: ProjectSettings,
  sourceText: string,
  translationText: string,
  issues: QAIssue[]
) {
  const sourceStats = getTextStats(sourceText);
  const translationStats = getTextStats(translationText);
  const checklist = getStyleChecklist(settings.textType);
  const high = issues.filter((issue) => issue.severity === "high").length;
  const medium = issues.filter((issue) => issue.severity === "medium").length;
  const low = issues.filter((issue) => issue.severity === "low").length;
  const issueRows = issues
    .map((issue) => "| " + issue.severity + " | " + issue.type + " | " + issue.description + " | " + issue.suggestion + " | " + issue.status + " |")
    .join("\n");

  return [
    "# " + (settings.projectName || "AI 译文质检报告"),
    "",
    "生成日期：" + todayString(),
    "",
    "## 项目设置",
    "",
    "- 翻译方向：" + settings.direction,
    "- 文本类型：" + settings.textType,
    "- 目标风格：" + settings.targetStyle,
    "- 检查强度：" + settings.checkLevel,
    "",
    "## 文本统计",
    "",
    "- 原文段落：" + sourceStats.paragraphs,
    "- 原文英文词数：" + sourceStats.words,
    "- 译文段落：" + translationStats.paragraphs,
    "- 译文中文字符：" + translationStats.cjkChars,
    "",
    "## 问题统计",
    "",
    "- 总问题数：" + issues.length,
    "- 高风险：" + high,
    "- 中风险：" + medium,
    "- 低风险：" + low,
    "",
    "## 问题详情",
    "",
    "| 风险等级 | 问题类型 | 问题描述 | 建议处理 | 状态 |",
    "| --- | --- | --- | --- | --- |",
    issueRows || "| - | - | 暂无问题 | - | - |",
    "",
    "## 风格检查清单",
    "",
    checklist.map((item) => "- [ ] " + item).join("\n")
  ].join("\n");
}
