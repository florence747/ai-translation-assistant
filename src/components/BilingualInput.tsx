import { DatabaseZap, Eraser, FileText, Play, Rows3, Wand2 } from "lucide-react";
import { getTextStats } from "../utils/textStats";

type Props = {
  sourceText: string;
  translationText: string;
  onSourceChange: (value: string) => void;
  onTranslationChange: (value: string) => void;
  onClear: () => void;
  onClearLocal: () => void;
  onNormalize: () => void;
  onGenerateRows: () => void;
  onRunChecks: () => void;
  onLoadSample: () => void;
};

function StatsLine({ text, lang }: { text: string; lang: "source" | "translation" }) {
  const stats = getTextStats(text);
  return <p className="stats-line">{stats.paragraphs} 段 · {lang === "source" ? stats.words + " 词" : stats.cjkChars + " 个中文字符"} · {stats.chars} 字符</p>;
}

export function BilingualInput(props: Props) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">区域 2</p>
          <h2>双语输入</h2>
        </div>
        <div className="toolbar">
          <button className="secondary" onClick={props.onLoadSample} title="载入示例数据"><FileText size={16} /> 载入示例数据</button>
          <button className="secondary" onClick={props.onNormalize} title="自动分段"><Wand2 size={16} /> 自动分段</button>
          <button className="secondary danger-text" onClick={props.onClear} title="清空文本"><Eraser size={16} /> 清空文本</button>
          <button className="secondary danger-text" onClick={props.onClearLocal} title="清空本地保存"><DatabaseZap size={16} /> 清空本地数据</button>
          <button className="secondary" onClick={props.onGenerateRows} title="生成双语编辑表"><Rows3 size={16} /> 生成编辑表</button>
          <button onClick={props.onRunChecks} title="开始检查"><Play size={16} /> 开始检查</button>
        </div>
      </div>
      <div className="input-grid">
        <label className="textarea-field">
          <span>原文</span>
          <textarea value={props.sourceText} onChange={(event) => props.onSourceChange(event.target.value)} placeholder="粘贴原文，支持多段文本" />
          <StatsLine text={props.sourceText} lang="source" />
        </label>
        <label className="textarea-field">
          <span>AI 译文</span>
          <textarea value={props.translationText} onChange={(event) => props.onTranslationChange(event.target.value)} placeholder="粘贴 AI 译文，支持多段文本" />
          <StatsLine text={props.translationText} lang="translation" />
        </label>
      </div>
    </section>
  );
}
