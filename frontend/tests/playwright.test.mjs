import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

let chromium;
try {
  const globalPackage = path.resolve(path.dirname(process.execPath), "../lib/node_modules/@playwright/mcp/package.json");
  const existing = process.env.PLAYWRIGHT_MODULE || createRequire(globalPackage).resolve("playwright");
  const available = await import(pathToFileURL(existing).href);
  chromium = available.chromium || available.default?.chromium;
} catch {}

test("existing Playwright verifies frontend interaction and captures labeled demo screenshots", { skip: !chromium, timeout: 120000 }, async () => {
  const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
  const scratch = path.join(root, "frontend/p");
  await mkdir(scratch, { recursive: true });
  const previousTemp = process.env.TMPDIR;
  process.env.TMPDIR = scratch;
  const server = createServer(async (request, response) => {
    try {
      const filename = path.resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
      if (!filename.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
      response.setHeader("Content-Type", /\.m?js$/.test(filename) ? "text/javascript" : filename.endsWith(".html") ? "text/html" : "text/plain");
      response.end(await readFile(filename));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/frontend/tests/interaction.html`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"], env: { ...process.env, TMPDIR: scratch } });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage(), errors = [], consoleErrors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
      await page.goto(url);
      await page.waitForFunction(() => typeof window.runInteractionTests === "function");
      const result = await page.evaluate(() => window.runInteractionTests());
      assert.equal(result.failed, 0, result.stack || result.error);
      assert.equal(result.passed, 10);
      console.log(`Playwright ${viewport.width}px: ${result.passed} fixture workflows passed`);
      await page.evaluate(() => {
        window.shellMenuCount = 0;
        document.addEventListener("hass-toggle-menu", event => { if (event.bubbles && event.composed) window.shellMenuCount++; });
      });
      await page.getByRole("button", { name: "Open Home Assistant navigation", exact: true }).click();
      assert.equal(await page.evaluate(() => window.shellMenuCount), 1, "Real pointer interaction reaches HA shell event listeners");

      await page.getByRole("button", { name: "Calendar", exact: true }).click();
      const quickAdd = page.getByRole("button", { name: /Quick add/ });
      await quickAdd.focus(); await quickAdd.click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor({ state: "visible" });
      for (let tab = 0; tab < 9; tab++) {
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(() => {
          const panel = document.querySelector("family-organizer-panel");
          return document.activeElement === document.body || !!panel.shadowRoot.activeElement?.closest("dialog");
        }), true, "Keyboard focus must stay in modal scope");
      }
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(await quickAdd.evaluate(button => button.getRootNode().activeElement === button), true, "Escape returns focus");

      await quickAdd.click();
      await page.locator(".quick-menu button").filter({ hasText: "Calendar event" }).click();
      await page.getByLabel("Event title", { exact: true }).fill("Playwright family event");
      assert.equal(await page.getByLabel("Event title", { exact: true }).evaluate(input => input.getRootNode().activeElement === input), true, "Editor receives focus");
      await page.getByLabel("Repeat", { exact: true }).selectOption("FREQ=DAILY");
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      await page.locator(".event-chip").filter({ hasText: "Playwright family event" }).first().click();
      await dialog.getByRole("button", { name: "Edit series", exact: true }).click();
      await page.getByLabel("Event title", { exact: true }).fill("Playwright edited event");
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      assert.ok(await page.locator(".event-chip").filter({ hasText: "Playwright edited event" }).count(), "Real pointer edit persists");

      await page.getByRole("button", { name: "Settings", exact: true }).click();
      for (const theme of ["Dark", "Light", "Auto"]) {
        await page.locator(".theme-options button").filter({ hasText: theme }).click();
        const actual = await page.locator(".app").getAttribute("data-theme");
        assert.equal(actual, theme.toLowerCase(), "Theme control updates mode");
      }
      await page.evaluate(() => {
        const panel = document.querySelector("family-organizer-panel");
        panel.hass = { ...panel._hass, themes: { darkMode: true } };
      });
      await page.waitForFunction(() => document.querySelector("family-organizer-panel").shadowRoot.querySelector(".app").dataset.theme === "dark");
      assert.equal(await page.locator(".app").evaluate(element => {
        const style = getComputedStyle(element);
        return style.color === "rgb(239, 242, 236)" && style.backgroundColor === "rgb(23, 28, 27)";
      }), true, "Auto follows Home Assistant dark mode with readable light text");
      await page.locator(".theme-options button").filter({ hasText: "Light" }).click();
      assert.equal(await page.locator(".app").evaluate(element => getComputedStyle(element).color), "rgb(48, 53, 46)");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No viewport overflow");
      assert.deepEqual(errors, [], "No uncaught browser errors");
      assert.deepEqual(consoleErrors, [], "No browser console errors");
      console.log(`Playwright ${viewport.width}px: zero console errors and uncaught JavaScript errors`);
      await context.close();
    }

    if (process.env.CAPTURE_SCREENSHOTS === "1") {
      const output = path.join(root, "docs/screenshots");
      await mkdir(output, { recursive: true });
      const screenshots = [
        ["calendar-desktop", "calendar", { width: 1440, height: 1000 }],
        ["calendar-mobile", "calendar", { width: 390, height: 844 }],
        ["groceries", "groceries", { width: 1440, height: 1000 }],
        ["chores", "chores", { width: 1440, height: 1000 }],
        ["recipes", "recipes", { width: 1440, height: 1000 }],
        ["settings", "settings", { width: 1440, height: 1000 }],
        ["event-detail", "calendar", { width: 1440, height: 1000 }, "event-detail"],
        ["event-dialog", "calendar", { width: 1440, height: 1000 }, "event-dialog"],
        ["event-dialog-mobile", "calendar", { width: 390, height: 844 }, "event-dialog"],
        ["recipe-detail", "recipes", { width: 1440, height: 1000 }, "recipe-detail"],
      ];
      for (const [filename, section, viewport, mode] of screenshots) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
        const page = await context.newPage();
        await page.goto(`${url}#fo/${section}`);
        await page.waitForFunction(() => !document.querySelector("family-organizer-panel").loading);
        await page.evaluate(label => {
          document.querySelector("#test-tools").textContent = `Family Organizer • ${label} • Demo fixtures • not a live Home Assistant installation`;
        }, filename.replaceAll("-", " "));
        if (mode?.startsWith("event")) {
          await page.locator(".event-chip").first().click();
          if (mode === "event-dialog") await page.getByRole("dialog").getByRole("button", { name: "Edit series", exact: true }).click();
          await page.locator("dialog .dialog-heading .eyebrow").evaluate(label => label.textContent = "Demo fixtures • not a live Home Assistant installation");
        } else if (mode === "recipe-detail") {
          await page.locator(".recipe-card").first().click();
        }
        await page.screenshot({ path: path.join(output, `fixture-${filename}.png`), fullPage: viewport.width >= 700 && !mode?.startsWith("event") });
        console.log(`Screenshot: docs/screenshots/fixture-${filename}.png`);
        await context.close();
      }
      await copyFile(path.join(output, "fixture-calendar-desktop.png"), path.join(root, "docs/family-organizer-calendar.png"));
      console.log("Updated README image: docs/family-organizer-calendar.png");
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
    if (previousTemp === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = previousTemp;
    await rm(scratch, { recursive: true, force: true });
  }
});
