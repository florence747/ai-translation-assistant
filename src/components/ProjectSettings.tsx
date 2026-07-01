import type { CheckLevel, ProjectSettings, TargetStyle, TextType, TranslationDirection } from "../types";

type Props = {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
};

const directionOptions: Array<[TranslationDirection, string]> = [["en-zh", "英译中"], ["zh-en", "中译英"]];
const textTypeOptions: Array<[TextType, string]> = [["technical", "技术文档"], ["website", "官网文案"], ["product", "产品说明"], ["app-ui", "App UI"], ["academic", "学术摘要"], ["general", "通用文本"]];
const targetStyleOptions: Array<[TargetStyle, string]> = [["accurate", "准确简洁"], ["natural", "自然流畅"], ["formal", "正式专业"], ["marketing", "营销本地化"], ["academic", "学术规范"]];
const checkLevelOptions: Array<[CheckLevel, string]> = [["basic", "基础检查"], ["standard", "标准检查"], ["strict", "严格检查"]];

export function ProjectSettingsPanel({ settings, onChange }: Props) {
  function update<K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">区域 1</p>
          <h2>项目设置</h2>
        </div>
      </div>
      <div className="settings-grid">
        <label>
          <span>项目名称</span>
          <input value={settings.projectName} onChange={(event) => update("projectName", event.target.value)} placeholder="例如：官网产品页译后编辑" />
        </label>
        <label>
          <span>翻译方向</span>
          <select value={settings.direction} onChange={(event) => update("direction", event.target.value as TranslationDirection)}>
            {directionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>文本类型</span>
          <select value={settings.textType} onChange={(event) => update("textType", event.target.value as TextType)}>
            {textTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>目标风格</span>
          <select value={settings.targetStyle} onChange={(event) => update("targetStyle", event.target.value as TargetStyle)}>
            {targetStyleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>检查强度</span>
          <select value={settings.checkLevel} onChange={(event) => update("checkLevel", event.target.value as CheckLevel)}>
            {checkLevelOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
