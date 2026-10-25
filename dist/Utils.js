const UPPER_CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function toKebabCaseFromSnakeCase(kebabCase) {
    return kebabCase
        .split("")
        .map((it) => (UPPER_CHAR.includes(it) ? `-${it.toLowerCase()}` : it))
        .join("");
}
//# sourceMappingURL=Utils.js.map