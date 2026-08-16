import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import type { Server } from "node:http";

import app from "./app";

let server: Server;
let baseUrl: string;

before(async () => {
    await new Promise<void>((resolve) => {
        server = app.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test("health endpoint reports a healthy process", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json() as { status: string; uptime: number };

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(typeof body.uptime, "number");
    assert.equal(response.headers.get("x-powered-by"), null);
});

test("unsafe requests require the AJAX CSRF header", async () => {
    const response = await fetch(`${baseUrl}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "page_view", details: "test" }),
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Geçersiz istek kaynağı." });
});

test("unknown endpoints return structured JSON", async () => {
    const response = await fetch(`${baseUrl}/api/does-not-exist`);
    const body = await response.json() as { error: string };

    assert.equal(response.status, 404);
    assert.match(body.error, /Endpoint bulunamadı/);
});

test("untrusted browser origins are rejected", async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: "https://attacker.invalid" },
    });

    assert.equal(response.status, 403);
});
