// @ts-nocheck
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/styles.ts", import.meta.url)), "utf8");
const sheet = source.slice(source.indexOf("css`") + 4, source.lastIndexOf("`"));

test("stylesheet braces are balanced so no rules are swallowed by CSS nesting", () => {
  let depth = 0;
  let line = 1;
  for (const char of sheet) {
    if (char === "\n") line++;
    if (char === "{") depth++;
    if (char === "}") {
      depth--;
      assert.ok(depth >= 0, `unexpected '}' at line ${line}`);
    }
  }
  assert.equal(depth, 0, "stylesheet has an unclosed '{' — later rules would be treated as nested and ignored");
});

test("time grid selectors are defined at the top level", () => {
  const lines = sheet.split("\n");
  let depth = 0;
  const topLevel = new Set();
  for (const raw of lines) {
    const text = raw.trim();
    if (depth === 0 || (depth === 1 && /^\s*@media/.test(sheet))) {
      const match = text.match(/^([^@{}]+)\{/);
      if (match && depth === 0) for (const sel of match[1].split(",")) topLevel.add(sel.trim());
    }
    for (const char of text) {
      if (char === "{") depth++;
      if (char === "}") depth = Math.max(0, depth - 1);
    }
  }
  for (const selector of [".time-body", ".time-column", ".hour-slot", ".positioned-events", ".now-line", ".month-grid", ".month-cell"]) {
    assert.ok([...topLevel].some(sel => sel.startsWith(selector)), `${selector} must be a top-level rule`);
  }
});
