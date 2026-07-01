import { Download, Plus, Trash2 } from "lucide-react";
import type { TermItem } from "../types";

type Props = {
  terms: TermItem[];
  onChange: (terms: TermItem[]) => void;
  onExport: () => void;
};

function parseForbidden(value: string) {
  return value.split(/[;,，；/]/).map((item) => item.trim()).filter(Boolean);
}

export function TermTable({ terms, onChange, onExport }: Props) {
  function updateTerm(id: string, patch: Partial<TermItem>) {
    onChange(terms.map((term) => (term.id === id ? { ...term, ...patch } : term)));
  }

  function addTerm() {
    onChange([...terms, { id: "term-" + Date.now(), sourceTerm: "", approvedTranslation: "", forbiddenTranslations: [], note: "" }]);
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">区域 3</p>
          <h2>术语表</h2>
        </div>
        <div className="toolbar">
          <button className="secondary" onClick={addTerm} title="添加术语"><Plus size={16} /> 添加</button>
          <button className="secondary" onClick={() => onChange([])} title="清空术语表"><Trash2 size={16} /> 清空</button>
          <button className="secondary" onClick={onExport} title="导出术语表 CSV"><Download size={16} /> 导出 CSV</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>原文术语</th><th>指定译名</th><th>禁用译名</th><th>备注</th><th>操作</th></tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <tr key={term.id}>
                <td><input value={term.sourceTerm} onChange={(event) => updateTerm(term.id, { sourceTerm: event.target.value })} /></td>
                <td><input value={term.approvedTranslation} onChange={(event) => updateTerm(term.id, { approvedTranslation: event.target.value })} /></td>
                <td><input value={term.forbiddenTranslations.join("，")} onChange={(event) => updateTerm(term.id, { forbiddenTranslations: parseForbidden(event.target.value) })} /></td>
                <td><input value={term.note ?? ""} onChange={(event) => updateTerm(term.id, { note: event.target.value })} /></td>
                <td><button className="icon-button" onClick={() => onChange(terms.filter((item) => item.id !== term.id))} title="删除术语"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {terms.length === 0 && <tr><td colSpan={5} className="empty-cell">暂无术语。点击“添加”手动维护项目术语。</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
