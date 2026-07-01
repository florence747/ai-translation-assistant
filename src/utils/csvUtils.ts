export function csvEscape(value: string | number | undefined) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function rowsToCsv(rows: Array<Array<string | number | undefined>>) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}
