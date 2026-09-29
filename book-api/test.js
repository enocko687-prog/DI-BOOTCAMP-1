const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const request = require("supertest");
const app = require("./app");

describe("Book API", () => {
  it("supports create, read, update, and delete", async () => {
    let response = await request(app).post("/api/books").send({
      title: "Dune",
      author: "Frank Herbert",
      publishedYear: 1965,
    });
    assert.equal(response.status, 201);
    const { id } = response.body;

    response = await request(app).get(`/api/books/${id}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.title, "Dune");

    response = await request(app).put(`/api/books/${id}`).send({ title: "Dune Messiah" });
    assert.equal(response.status, 200);
    assert.equal(response.body.title, "Dune Messiah");

    response = await request(app).delete(`/api/books/${id}`);
    assert.equal(response.status, 204);
  });

  it("returns 404 for a missing book", async () => {
    const response = await request(app).get("/api/books/999999");
    assert.equal(response.status, 404);
    assert.equal(response.body.error, "Book not found");
  });
});
