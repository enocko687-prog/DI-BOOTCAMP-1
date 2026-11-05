"use strict";

const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../server");
const { closePool } = require("../database");
const { validateMessage } = require("../routes/contact");

let server;
let baseURL;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    await closePool();
});

test("serves the portfolio pages and local assets without publishing the draft CV", async () => {
    for (const page of ["/", "/about.html", "/projects.html", "/contact.html"]) {
        const response = await fetch(`${baseURL}${page}`);
        assert.equal(response.status, 200, `${page} should load`);
        assert.match(response.headers.get("content-type"), /text\/html/);
    }

    const portrait = await fetch(`${baseURL}/assets/images/enock-brighton.jpg`);
    assert.equal(portrait.status, 200);
    assert.match(portrait.headers.get("content-type"), /image\/jpeg/);

    const cv = await fetch(`${baseURL}/enock-brighton-cv.txt`);
    assert.equal(cv.status, 404);
});

test("validates messages and rejects invalid requests without database access", async () => {
    assert.deepEqual(
        validateMessage({
            fullName: " Enock ",
            email: "enock@example.com",
            subject: " Hello ",
            message: " Message "
        }),
        {
            fullName: "Enock",
            email: "enock@example.com",
            subject: "Hello",
            message: "Message"
        }
    );
    assert.ok(validateMessage({
        fullName: "Enock",
        email: "not-an-email",
        subject: "",
        message: "Hello"
    }).error);
    assert.ok(validateMessage({
        fullName: "E".repeat(121),
        email: "enock@example.com",
        subject: "",
        message: "Hello"
    }).error);

    const wrongType = await fetch(`${baseURL}/api/contact`, { method: "POST" });
    assert.equal(wrongType.status, 415);

    const invalid = await fetch(`${baseURL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fullName: "Enock",
            email: "bad-address",
            subject: "",
            message: "Hello"
        })
    });
    assert.equal(invalid.status, 400);
});

test("health endpoint reports database availability honestly", async () => {
    const response = await fetch(`${baseURL}/api/health`);
    assert.ok([200, 503].includes(response.status));
    const result = await response.json();
    assert.equal(result.status, response.ok ? "Online" : "Offline");
    assert.equal(result.database, response.ok ? "Connected" : "Disconnected");
});
