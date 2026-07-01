import { useMemo, useState } from "react";
import type { IssueStatus, IssueType, ProjectSettings, QAIssue } from "../types";
import { getStyleChecklist } from "../utils/qaRules";

type Props = {
  settings: ProjectSettings;
  issues: QAIssue[];
  onChange: (issues: QAIssue[]) => void;
};

const issueTypeLabels: Record<QAIssue["type"], string> = {
  term: "术语",
  number: "数字",
  "proper-noun": "专名",
  "english-residue": "英文残留",
  paragraph: "段落",
  style: "风格提示"
};

const severityLabels: Record<QAIssue["severity"], string> = { high: "高", medium: "中", low: "低" };
const statusLabels: Record<IssueStatus, string> = { pending: "待处理", resolved: "已处理", ignored: "忽略" };

export function QAResults({ settings, issues, onChange }: Props) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const severityMatched = severityFilter === "all" || issue.severity === severityFilter;
      const typeMatched = typeFilter === "all" || issue.type === typeFilter;
      return severityMatched && typeMatched;
    });
  }, [issues, severityFilter, typeFilter]);

  const stats: Array<[string, number, string]> = [
    ["总问题数", issues.length, "neutral"],
    ["高风险", issues.filter((issue) => issue.severity === "high").length, "high"],
    ["中风险", issues.filter((issue) => issue.severity === "medium").length, "medium"],
    ["低风险", issues.filter((issue) => issue.severity === "low").length, "low"],
    ["术语问题", issues.filter((issue) => issue.type === "term").length, "term"],
    ["数字问题", issues.filter((issue) => issue.type === "number").length, "number"],
    ["专名问题", issues.filter((issue) => issue.type === "proper-noun").length, "proper"],
    ["英文残留", issues.filter((issue) => issue.type === "english-residue").length, "residue"]
  ];

  function updateStatus(id: string, status: IssueStatus) {
    onChange(issues.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
  }

  return (
    <section className="section">
      <div className="section-header">
        <div><p className="eyebrow">区域 4</p><h2>自动检查</h2></div>
      </div>
      <div className="stats-grid">
        {stats.map(([label, value, tone]) => <div className={"stat-card " + tone} key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="filter-bar">
        <label><span>风险筛选</span><select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option value="all">全部风险</option><option value="high">高风险</option><option value="medium">中风险</option><option value="low">低风险</option></select></label>
        <label><span>类型筛选</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as IssueType | "all")}><option value="all">全部类型</option>{Object.entries(issueTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <p>当前显示 {filteredIssues.length} / {issues.length} 条</p>
      </div>
      <div className="checklist-row">
        {getStyleChecklist(settings.textType).map((item) => <label key={item} className="check-item"><input type="checkbox" /><span>{item}</span></label>)}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>风险等级</th><th>问题类型</th><th>问题描述</th><th>建议处理</th><th>状态</th></tr></thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td><span className={"badge " + issue.severity}>{severityLabels[issue.severity]}</span></td>
                <td>{issueTypeLabels[issue.type]}</td>
                <td>{issue.description}</td>
                <td>{issue.suggestion}</td>
                <td><select value={issue.status} onChange={(event) => updateStatus(issue.id, event.target.value as IssueStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
              </tr>
            ))}
            {issues.length === 0 && <tr><td colSpan={5} className="empty-cell">尚未生成检查结果。点击“开始检查”后会在这里显示问题。</td></tr>}
            {issues.length > 0 && filteredIssues.length === 0 && <tr><td colSpan={5} className="empty-cell">当前筛选条件下没有问题。</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
