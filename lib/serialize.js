export function toMoneyString(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return v;
    if (typeof v === "number") return v.toFixed(2);
    if (typeof v === "object" && typeof v.toString === "function") return v.toString();
    return String(v);
  }
  