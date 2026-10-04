import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Uses the existing Chromium binary and Node's native CDP WebSocket, not a testing dependency.
test("frontend browser interactions at desktop and mobile sizes", { timeout: 120000 }, async () => {
  const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
  const profile = path.join(root, "frontend/b"), scratch = path.join(root, "frontend/t");
  await mkdir(profile, { recursive: true }); await mkdir(scratch, { recursive: true });
  const server = createServer(async (request, response) => {
    try {
      const filename = path.resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
      if (!filename.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
      const content = await readFile(filename);
      response.setHeader("Content-Type", filename.endsWith(".html") ? "text/html" : filename.endsWith(".js") || filename.endsWith(".mjs") ? "text/javascript" : "text/plain");
      response.end(content);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const browser = spawn(process.env.CHROMIUM || "chromium", [
    "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--disable-background-networking", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--crash-dumps-dir=${scratch}`, "about:blank",
  ], { env: { ...process.env, TMPDIR: scratch }, stdio: ["ignore", "ignore", "pipe"] });
  let logs = "";
  browser.stderr.on("data", chunk => logs += chunk.toString());
  let socket;
  const pause = () => new Promise(resolve => setTimeout(resolve, 50));
  try {
    let debugPort;
    for (let i = 0; i < 200; i++) {
      try { debugPort = Number((await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); if (debugPort) break; } catch {}
      if (browser.exitCode !== null) throw new Error(`Chromium exited: ${logs}`);
      await pause();
    }
    assert.ok(debugPort, `Chromium did not start: ${logs}`);
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    socket = new WebSocket(targets.find(target => target.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
    let id = 0;
    const pending = new Map();
    const errors = [];
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); }
      if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text + " " + (message.params.exceptionDetails.exception?.description || ""));
    });
    const command = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params })); });
    const evaluate = async expression => {
      const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result?.value;
    };
    await command("Runtime.enable"); await command("Page.enable");
    for (const [width, height] of [[1440, 1000], [390, 844]]) {
      await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
      await command("Page.navigate", { url: `http://127.0.0.1:${port}/frontend/tests/interaction.html` });
      let ready = false;
      for (let i = 0; i < 100; i++) { if (await evaluate("typeof window.runInteractionTests === 'function'")) { ready = true; break; } await pause(); }
      assert.ok(ready, `Test fixture did not load: ${errors.join("\n")}`);
      const result = await evaluate("window.runInteractionTests()");
      console.log(`${width}px: ${JSON.stringify(result)}`);
      assert.equal(result.failed, 0, result.stack || result.error);
      assert.equal(result.passed, 10);
      const overflow = await evaluate("document.documentElement.scrollWidth > innerWidth");
      assert.equal(overflow, false, `${width}px: page must not overflow horizontally`);
      await evaluate("document.querySelector('family-organizer-panel').shadowRoot.querySelector('.quick-add').focus(); document.querySelector('family-organizer-panel').shadowRoot.querySelector('.quick-add').click()");
      await pause();
      for (let tab = 0; tab < 8; tab++) {
        await command("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        await command("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        assert.equal(await evaluate("document.activeElement === document.body || !!document.querySelector('family-organizer-panel').shadowRoot.activeElement?.closest('dialog')"), true, "Tab must stay within the native modal focus scope");
      }
      await command("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
      await command("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
      await pause();
      assert.equal(await evaluate("!!document.querySelector('family-organizer-panel').shadowRoot.querySelector('dialog')"), false, "Escape must close dialog");
      assert.equal(await evaluate("document.querySelector('family-organizer-panel').shadowRoot.activeElement.classList.contains('quick-add')"), true, "Escape must restore focus");
    }
    assert.deepEqual(errors, [], "Browser must not emit uncaught JavaScript errors");
  } finally {
    socket?.close(); browser.kill("SIGTERM");
    await new Promise(resolve => { if (browser.exitCode !== null) resolve(); else browser.once("exit", resolve); });
    await new Promise(resolve => server.close(resolve));
    await rm(profile, { recursive: true, force: true }); await rm(scratch, { recursive: true, force: true });
  }
});
