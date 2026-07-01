import { Clipboard, Download } from "lucide-react";

type Props = {
  onCopyFinal: () => void;
  onExportFinalTxt: () => void;
  onExportReport: () => void;
  onExportEditingCsv: () => void;
  onExportTermsCsv: () => void;
  copyStatus: string;
};

export function ExportPanel(props: Props) {
  return (
    <section className="section export-section">
      <div className="section-header"><div><p className="eyebrow">区域 6</p><h2>导出</h2></div></div>
      <div className="export-grid">
        <button onClick={props.onCopyFinal} title="复制最终译文"><Clipboard size={16} /> 复制最终译文</button>
        <button className="secondary" onClick={props.onExportFinalTxt} title="导出 TXT"><Download size={16} /> 最终译文 TXT</button>
        <button className="secondary" onClick={props.onExportReport} title="导出 Markdown 报告"><Download size={16} /> 检查报告 MD</button>
        <button className="secondary" onClick={props.onExportEditingCsv} title="导出修改记录 CSV"><Download size={16} /> 修改记录 CSV</button>
        <button className="secondary" onClick={props.onExportTermsCsv} title="导出术语表 CSV"><Download size={16} /> 术语表 CSV</button>
      </div>
      {props.copyStatus && <p className="copy-status">{props.copyStatus}</p>}
    </section>
  );
}
