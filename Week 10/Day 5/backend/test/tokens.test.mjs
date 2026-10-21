import assert from "node:assert/strict";
import test from "node:test";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../dist/backend/src/helpers/tokens.js";

process.env.JWT_SECRET = "test-access-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
process.env.REFRESH_SECRET = "test-refresh-secret-0123456789-abcdefghijklmnopqrstuvwxyz";

test("access tokens identify their user and reject refresh tokens", () => {
  const access = createAccessToken(42);
  assert.equal(verifyAccessToken(access), 42);
  const refresh = createRefreshToken(42);
  assert.throws(() => verifyAccessToken(refresh.token));
});

test("refresh tokens are signed separately and stored as hashes", () => {
  const refresh = createRefreshToken(19);
  assert.equal(verifyRefreshToken(refresh.token), 19);
  assert.equal(hashRefreshToken(refresh.token), refresh.hash);
  assert.notEqual(refresh.token, refresh.hash);
  assert.throws(() => verifyRefreshToken(createAccessToken(19)));
});

test("JWT secrets must be configured and sufficiently long", () => {
  process.env.JWT_SECRET = "short";
  assert.throws(() => createAccessToken(1), /at least 32 characters/);
  process.env.JWT_SECRET = "test-access-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
});
