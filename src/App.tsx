import { useEffect, useMemo, useState } from "react";
import { BilingualInput } from "./components/BilingualInput";
import { EditingTable } from "./components/EditingTable";
import { ExportPanel } from "./components/ExportPanel";
import { ProjectSettingsPanel } from "./components/ProjectSettings";
import { QAResults } from "./components/QAResults";
import { TermTable } from "./components/TermTable";
import { sampleSettings, sampleSourceText, sampleTerms, sampleTranslationText } from "./data/sampleData";
import type { EditingRow, ProjectSettings, QAIssue, TermItem } from "./types";
import { buildEditingCsv, buildFinalTranslation, buildMarkdownReport, buildTermCsv, downloadText, safeFileName, todayString } from "./utils/exportUtils";
import { runQAChecks } from "./utils/qaRules";
import { normalizeText, splitParagraphs } from "./utils/textStats";

const defaultSettings: ProjectSettings = {
  projectName: "",
  direction: "en-zh",
  textType: "general",
  targetStyle: "accurate",
  checkLevel: "standard"
};

type StoredState = {
  settings: ProjectSettings;
  sourceText: string;
  translationText: string;
  terms: TermItem[];
  issues: QAIssue[];
  rows: EditingRow[];
};

function buildRows(sourceText: string, translationText: string, issues: QAIssue[]): EditingRow[] {
  const sourceParagraphs = splitParagraphs(sourceText);
  const translationParagraphs = splitParagraphs(translationText);
  const maxRows = Math.max(sourceParagraphs.length, translationParagraphs.length);

  return Array.from({ length: maxRows }, (_, index) => {
    const rowIssues = issues.filter((issue) => issue.paragraphIndex === index).map((issue) => issue.description);
    return {
      id: "row-" + (index + 1) + "-" + Date.now(),
      index: index + 1,
      sourceText: sourceParagraphs[index] ?? "",
      aiTranslation: translationParagraphs[index] ?? "",
      detectedIssues: rowIssues,
      revisedTranslation: translationParagraphs[index] ?? "",
      revisionNote: "",
      status: rowIssues.length > 0 ? "needs-confirmation" : "pending"
    };
  });
}

function getInitialState(): StoredState {
  const raw = localStorage.getItem("translation-qa-state");
  if (raw) {
    try {
      return JSON.parse(raw) as StoredState;
    } catch {
      localStorage.removeItem("translation-qa-state");
    }
  }
  return { settings: defaultSettings, sourceText: "", translationText: "", terms: [], issues: [], rows: [] };
}

export default function App() {
  const initialState = useMemo(getInitialState, []);
  const [settings, setSettings] = useState<ProjectSettings>(initialState.settings);
  const [sourceText, setSourceText] = useState(initialState.sourceText);
  const [translationText, setTranslationText] = useState(initialState.translationText);
  const [terms, setTerms] = useState<TermItem[]>(initialState.terms);
  const [issues, setIssues] = useState<QAIssue[]>(initialState.issues);
  const [rows, setRows] = useState<EditingRow[]>(initialState.rows);
  const [copyStatus, setCopyStatus] = useState("");

  const hasParagraphMismatch = splitParagraphs(sourceText).length !== splitParagraphs(translationText).length;
  const fileBase = safeFileName(settings.projectName || "AI译文质检") + "_" + todayString();

  useEffect(() => {
    const state: StoredState = { settings, sourceText, translationText, terms, issues, rows };
    localStorage.setItem("translation-qa-state", JSON.stringify(state));
  }, [settings, sourceText, translationText, terms, issues, rows]);

  function runChecks() {
    const nextIssues = runQAChecks(settings, sourceText, translationText, terms);
    setIssues(nextIssues);
    setRows((currentRows) => {
      if (currentRows.length === 0) return buildRows(sourceText, translationText, nextIssues);
      return currentRows.map((row) => ({
        ...row,
        detectedIssues: nextIssues.filter((issue) => issue.paragraphIndex === row.index - 1).map((issue) => issue.description)
      }));
    });
  }

  function generateRows() {
    setRows(buildRows(sourceText, translationText, issues));
  }

  function loadSample() {
    setSettings(sampleSettings);
    setSourceText(sampleSourceText);
    setTranslationText(sampleTranslationText);
    setTerms(sampleTerms);
    const nextIssues = runQAChecks(sampleSettings, sampleSourceText, sampleTranslationText, sampleTerms);
    setIssues(nextIssues);
    setRows(buildRows(sampleSourceText, sampleTranslationText, nextIssues));
  }

  function normalizeInputs() {
    setSourceText((value) => normalizeText(value));
    setTranslationText((value) => normalizeText(value));
  }

  function clearTexts() {
    setSourceText("");
    setTranslationText("");
    setIssues([]);
    setRows([]);
  }

  function clearLocalData() {
    localStorage.removeItem("translation-qa-state");
    setSettings(defaultSettings);
    setSourceText("");
    setTranslationText("");
    setTerms([]);
    setIssues([]);
    setRows([]);
    setCopyStatus("本地保存的数据已清空。");
    window.setTimeout(() => setCopyStatus(""), 2200);
  }

  async function copyFinalTranslation() {
    const content = buildFinalTranslation(rows);
    if (!content) {
      setCopyStatus("暂无可复制的最终译文。");
      return;
    }
    await navigator.clipboard.writeText(content);
    setCopyStatus("最终译文已复制。");
    window.setTimeout(() => setCopyStatus(""), 2200);
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">AI Translation QA & Post-editing Assistant · v1.1</p>
          <h1>AI 译文质检与译后编辑助手</h1>
          <p className="app-lead">本工具不直接翻译，只用于 AI 译文规则检查、人工译后编辑和结果导出。</p>
        </div>
        <div className="header-summary"><span>静态前端</span><span>规则检查</span><span>人工编辑</span><span>结果导出</span></div>
      </header>
      <section className="usage-steps" aria-label="使用步骤">
        <div><strong>1</strong><span>输入文本和术语表</span></div>
        <div><strong>2</strong><span>开始检查并处理问题</span></div>
        <div><strong>3</strong><span>编辑译文并导出结果</span></div>
      </section>
      <ProjectSettingsPanel settings={settings} onChange={setSettings} />
      <BilingualInput
        sourceText={sourceText}
        translationText={translationText}
        onSourceChange={setSourceText}
        onTranslationChange={setTranslationText}
        onClear={clearTexts}
        onClearLocal={clearLocalData}
        onNormalize={normalizeInputs}
        onGenerateRows={generateRows}
        onRunChecks={runChecks}
        onLoadSample={loadSample}
      />
      <TermTable terms={terms} onChange={setTerms} onExport={() => downloadText(fileBase + "_术语表.csv", buildTermCsv(terms), "text/csv;charset=utf-8")} />
      <QAResults settings={settings} issues={issues} onChange={setIssues} />
      <EditingTable rows={rows} hasParagraphMismatch={hasParagraphMismatch} onChange={setRows} />
      <ExportPanel
        copyStatus={copyStatus}
        onCopyFinal={copyFinalTranslation}
        onExportFinalTxt={() => downloadText(fileBase + "_最终译文.txt", buildFinalTranslation(rows))}
        onExportReport={() => downloadText(fileBase + "_检查报告.md", buildMarkdownReport(settings, sourceText, translationText, issues), "text/markdown;charset=utf-8")}
        onExportEditingCsv={() => downloadText(fileBase + "_修改记录.csv", buildEditingCsv(rows), "text/csv;charset=utf-8")}
        onExportTermsCsv={() => downloadText(fileBase + "_术语表.csv", buildTermCsv(terms), "text/csv;charset=utf-8")}
      />
    </main>
  );
}
