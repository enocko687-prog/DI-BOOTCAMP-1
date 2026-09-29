const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const request = require("supertest");
const app = require("./server/app");

describe("Blog API request validation", () => {
  it("rejects invalid post IDs", async () => {
    const response = await request(app).get("/posts/not-an-id");
    assert.equal(response.status, 400);
  });

  it("rejects an empty title before accessing the database", async () => {
    const response = await request(app).post("/posts").send({
      title: "",
      content: "A post",
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.error, "title must be a non-empty string");
  });

  it("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/unknown");
    assert.equal(response.status, 404);
  });
});
