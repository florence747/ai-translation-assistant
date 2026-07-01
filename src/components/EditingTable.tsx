import type { EditingRow, EditingRowStatus } from "../types";

type Props = {
  rows: EditingRow[];
  hasParagraphMismatch: boolean;
  onChange: (rows: EditingRow[]) => void;
};

const statusLabels: Record<EditingRowStatus, string> = {
  pending: "待修改",
  revised: "已修改",
  ignored: "忽略",
  "needs-confirmation": "需确认"
};

export function EditingTable({ rows, hasParagraphMismatch, onChange }: Props) {
  function updateRow(id: string, patch: Partial<EditingRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <section className="section">
      <div className="section-header"><div><p className="eyebrow">区域 5</p><h2>双语译后编辑表</h2></div></div>
      {hasParagraphMismatch && <div className="notice">原文和译文段落数不一致，已按最大行数生成编辑表，请手动检查段落对应关系。</div>}
      <div className="table-wrap editing-table">
        <table>
          <thead><tr><th>编号</th><th>原文</th><th>AI 译文</th><th>检测问题</th><th>修改后译文</th><th>修改说明</th><th>状态</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.index}</td>
                <td>{row.sourceText}</td>
                <td>{row.aiTranslation}</td>
                <td>{row.detectedIssues.join("；")}</td>
                <td><textarea value={row.revisedTranslation} onChange={(event) => updateRow(row.id, { revisedTranslation: event.target.value, status: event.target.value !== row.aiTranslation ? "revised" : row.status })} /></td>
                <td><textarea value={row.revisionNote} onChange={(event) => updateRow(row.id, { revisionNote: event.target.value })} /></td>
                <td><select value={row.status} onChange={(event) => updateRow(row.id, { status: event.target.value as EditingRowStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="empty-cell">尚未生成编辑表。点击“生成编辑表”即可开始译后编辑。</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
