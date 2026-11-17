import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { execFileSync } from "node:child_process";
import pg from "pg";

test("database migrations, authentication and listing CRUD", {
  skip: process.env.MARKETPLACE_TEST_DATABASE !== "1" && "Set MARKETPLACE_TEST_DATABASE=1 with PG connection settings to test a disposable database",
}, async t => {
  const admin = new pg.Client({ database: "postgres" });
  await admin.connect();
  const name = "marketplace_test_" + Date.now() + "_" + process.pid;
  let created = false;
  let pool;
  let server;
  t.after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    if (created) await admin.query("DROP DATABASE " + pg.escapeIdentifier(name));
    await admin.end();
  });
  await admin.query("CREATE DATABASE " + pg.escapeIdentifier(name));
  created = true;
  process.env.PGDATABASE = name;
  for (let run = 0; run < 2; run++) {
    execFileSync(process.execPath, ["src/db/setup.js"], {
      cwd: new URL("../", import.meta.url), env: process.env, windowsHide: true, stdio: "pipe",
    });
  }
  ({ pool } = await import("../src/db/pool.js"));
  const { app } = await import("../src/app.js");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = "http://127.0.0.1:" + server.address().port;
  async function request(path, { method = "GET", body, cookie } = {}) {
    const response = await fetch(base + "/api" + path, {
      method, headers: { ...(body !== undefined && { "Content-Type": "application/json" }), ...(cookie && { cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json(),
      cookie: response.headers.get("set-cookie")?.split(";")[0] };
  }
  const seller = { userId: "Seller_1", name: "Seller Name", email: "seller@example.com", password: "correct-password" };
  let cookie;
  let listingId;
  await t.test("health and migrations are healthy and repeatable", async () => {
    assert.equal((await request("/health")).status, 200);
    assert.equal((await pool.query("SELECT * FROM schema_migrations")).rowCount, 4);
  });
  await t.test("signup, duplicate accounts, invalid input and password verification", async () => {
    const signup = await request("/auth/signup", { method: "POST", body: seller });
    assert.equal(signup.status, 201);
    assert.equal(signup.body.user.userId, seller.userId);
    assert.equal(signup.body.user.passwordHash, undefined);
    cookie = signup.cookie;
    assert.equal((await request("/auth/me", { cookie })).body.user.name, seller.name);
    assert.equal((await request("/auth/signup", { method: "POST", body: { ...seller, userId: "seller_1", email: "different@example.com" } })).status, 409);
    assert.equal((await request("/auth/signup", { method: "POST", body: { ...seller, userId: "other_seller", email: "SELLER@example.com" } })).status, 409);
    assert.equal((await request("/auth/signup", { method: "POST", body: { ...seller, password: "short" } })).status, 400);
    for (const userId of [seller.userId, "unknown"]) {
      assert.equal((await request("/auth/signin", { method: "POST", body: { userId, password: "wrong" } })).status, 401);
    }
    const signin = await request("/auth/signin", { method: "POST", body: { userId: "seller_1", password: seller.password } });
    assert.equal(signin.status, 200);
    assert.equal(signin.body.user.userId, seller.userId);
  });
  await t.test("create, browse and read listing preserve seller identity and decimal prices", async () => {
    const result = await request("/listings", { method: "POST", cookie,
      body: { title: " Desk ", description: "Wooden desk", price: "12.50", category: "Furniture" } });
    assert.equal(result.status, 201);
    listingId = result.body.data.id;
    assert.equal(result.body.data.user_id, seller.userId);
    const all = await request("/listings");
    assert.equal(all.status, 200);
    assert.equal(all.body.data[0].seller_name, seller.name);
    const one = await request("/listings/" + listingId);
    assert.equal(one.status, 200);
    assert.equal(one.body.data.title, "Desk");
    assert.equal(one.body.data.price, "12.50");
  });
  await t.test("owner can update and zero is a valid price", async () => {
    const result = await request("/listings/" + listingId, { method: "PUT", cookie, body: { price: 0, status: "sold" } });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.price, "0.00");
    assert.equal(result.body.data.title, "Desk");
    assert.equal(result.body.data.status, "sold");
  });
  await t.test("invalid edits, missing listings and nonowners return expected errors", async () => {
    const other = await request("/auth/signup", { method: "POST", body: { ...seller, userId: "Buyer_1", email: "buyer@example.com" } });
    for (const method of ["PUT", "DELETE"]) {
      assert.equal((await request("/listings/" + listingId, { method, cookie: other.cookie, body: method === "PUT" ? { title: "Stolen" } : undefined })).status, 403);
    }
    for (const body of [{}, { title: null }, { price: -1 }, { price: "" }, { status: null }, { status: "x".repeat(51) }, []]) {
      assert.equal((await request("/listings/" + listingId, { method: "PUT", cookie, body })).status, 400);
    }
    assert.equal((await request("/listings/2147483647")).status, 404);
    assert.equal((await request("/listings/not-an-id")).status, 400);
  });
  await t.test("owner deletion and signout invalidate the record and session", async () => {
    assert.equal((await request("/listings/" + listingId, { method: "DELETE", cookie })).status, 200);
    assert.equal((await request("/listings/" + listingId)).status, 404);
    assert.equal((await request("/auth/signout", { method: "POST", cookie })).status, 204);
    assert.equal((await request("/auth/me", { cookie })).status, 401);
    assert.equal((await request("/auth/signout", { method: "POST" })).status, 204);
  });
  await t.test("expired sessions are rejected", async () => {
    const signin = await request("/auth/signin", { method: "POST", body: seller });
    await pool.query("UPDATE sessions SET expires_at = NOW() - INTERVAL '1 day'");
    assert.equal((await request("/auth/me", { cookie: signin.cookie })).status, 401);
  });
});
