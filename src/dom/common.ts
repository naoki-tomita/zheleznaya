import { toKebabCaseFromSnakeCase } from "../utils/string.ts";

export function renderStyleToString(style: Partial<CSSStyleDeclaration> | string): string {
  if (typeof style === "string") {
    return style;
  }
  const result = Object.entries(style)
    .map(([key, value]) => `${toKebabCaseFromSnakeCase(key)}: ${value}`)
    .join(";");
  if (result.length > 0) {
    return `${result};`;
  }
  return "";
}
