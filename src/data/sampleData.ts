import type { ProjectSettings, TermItem } from "../types";

export const sampleSettings: ProjectSettings = {
  projectName: "AI 译文质检示例",
  direction: "en-zh",
  textType: "technical",
  targetStyle: "accurate",
  checkLevel: "standard"
};

export const sampleSourceText = [
  "AI-powered localization platforms help teams manage translation workflows more efficiently.",
  "With terminology management, translation memory, and quality assurance tools, project managers can improve consistency across multilingual content.",
  "The new version supports 30% faster review speed and integrates with API-based automation."
].join("\n\n");

export const sampleTranslationText = [
  "AI 驱动的地方化平台帮助团队更高效地管理翻译工作流程。",
  "通过术语管理、翻译记忆和质量保障工具，项目经理可以提高多语言内容的一致性。",
  "新版本支持更快的审查速度，并集成了基于 API 的自动化。"
].join("\n\n");

export const sampleTerms: TermItem[] = [
  {
    id: "term-localization",
    sourceTerm: "localization",
    approvedTranslation: "本地化",
    forbiddenTranslations: ["地方化"],
    note: "软件和翻译行业语境"
  },
  {
    id: "term-workflow",
    sourceTerm: "workflow",
    approvedTranslation: "工作流",
    forbiddenTranslations: ["工作流程"],
    note: "技术语境优先用“工作流”"
  },
  {
    id: "term-translation-memory",
    sourceTerm: "translation memory",
    approvedTranslation: "翻译记忆库",
    forbiddenTranslations: ["翻译记忆"],
    note: "工具功能语境"
  },
  {
    id: "term-quality-assurance",
    sourceTerm: "quality assurance",
    approvedTranslation: "质量保证",
    forbiddenTranslations: ["质量保障"],
    note: "QA 常用译名"
  }
];
