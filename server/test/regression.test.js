import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { readSessionToken } from "../src/middleware/authMiddleware.js";
import * as listings from "../src/services/listingService.js";
import { app } from "../src/app.js";

test("session cookie parsing tolerates malformed and unrelated cookies", () => {
  assert.equal(readSessionToken({ headers: {} }), null);
  assert.equal(readSessionToken({ headers: { cookie: "other=x; session_token=hello%20world" } }), "hello world");
  assert.equal(readSessionToken({ headers: { cookie: "session_token=%invalid" } }), null);
});

test("invalid listing fields are rejected before database access", async () => {
  const valid = { title: "Desk", description: "Wood desk", price: "12.50", category: "Furniture" };
  for (const data of [undefined, null, [], {}, { ...valid, title: " " },
    { ...valid, category: 1 }, { ...valid, title: "x".repeat(256) },
    ...[-1, "", null, true, {}, "NaN", "Infinity", "0x10", "1.234", "100000000"].map(price => ({ ...valid, price }))]) {
    await assert.rejects(listings.createListing("seller", data), error => error.statusCode === 400);
  }
  for (const id of ["abc", "1.5", "-1", "0", "2147483648", "1 OR 1=1"]) {
    await assert.rejects(listings.getListingById(id), error => error.statusCode === 400);
  }
});

test("server starts and returns consistent API errors", async t => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = "http://127.0.0.1:" + server.address().port;
  for (const [url, options, status] of [
    ["/api/missing", {}, 404],
    ["/api/listings", { method: "POST" }, 401],
    ["/api/listings/1", { method: "PUT" }, 401],
    ["/api/listings/1", { method: "DELETE" }, 401],
    ["/api/auth/me", { headers: { cookie: "session_token=%invalid" } }, 401],
    ["/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }, 400],
    ["/api/auth/signup", { method: "POST" }, 400],
    ["/api/auth/signin", { method: "POST" }, 400],
  ]) {
    const response = await fetch(base + url, options);
    assert.equal(response.status, status, url);
    assert.match((await response.json()).error, /^Failed to /);
  }
});
