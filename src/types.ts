export type TranslationDirection = "en-zh" | "zh-en";
export type TextType = "technical" | "website" | "product" | "app-ui" | "academic" | "general";
export type TargetStyle = "accurate" | "natural" | "formal" | "marketing" | "academic";
export type CheckLevel = "basic" | "standard" | "strict";

export type ProjectSettings = {
  projectName: string;
  direction: TranslationDirection;
  textType: TextType;
  targetStyle: TargetStyle;
  checkLevel: CheckLevel;
};

export type TermItem = {
  id: string;
  sourceTerm: string;
  approvedTranslation: string;
  forbiddenTranslations: string[];
  note?: string;
};

export type IssueSeverity = "high" | "medium" | "low";
export type IssueType = "term" | "number" | "proper-noun" | "english-residue" | "paragraph" | "style";
export type IssueStatus = "pending" | "resolved" | "ignored";

export type QAIssue = {
  id: string;
  severity: IssueSeverity;
  type: IssueType;
  description: string;
  suggestion: string;
  status: IssueStatus;
  paragraphIndex?: number;
};

export type EditingRowStatus = "pending" | "revised" | "ignored" | "needs-confirmation";

export type EditingRow = {
  id: string;
  index: number;
  sourceText: string;
  aiTranslation: string;
  detectedIssues: string[];
  revisedTranslation: string;
  revisionNote: string;
  status: EditingRowStatus;
};
