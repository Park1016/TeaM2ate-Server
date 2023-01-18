import express from "express";
import "express-async-errors";
import { db } from "../db/database.js";

export async function getById(id) {
  return db
    .execute("SELECT * FROM user WHERE id=?", [id]) //
    .then((result) => result[0][0]);
}

export async function getByUsername(username) {
  return db
    .execute("SELECT * FROM user WHERE username=?", [username]) //
    .then((result) => result[0][0]);
}

export async function getByEmail(email) {
  return db
    .execute("SELECT * FROM user WHERE email=?", [email]) //
    .then((result) => result[0][0]);
}

export async function signUp(user) {
  const { username, password, name, email, url } = user;
  return db
    .execute(
      "INSERT INTO user (username, password, name, email, url, type, introduce, tag, bookmark, post, comment, follower, following, report, alert, send_offer, get_offer) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        username,
        password,
        name,
        email,
        url,
        "gen",
        "",
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
      ]
    )
    .then((result) => result[0].insertId);
}

export async function addList(userId, column, value) {
  const user = await getById(userId);
  const arr =
    column === "post"
      ? [value, ...user.post]
      : column === "comment"
      ? [value, ...user.comment]
      : [value, ...user.bookmark];
  return db
    .execute(`UPDATE user SET ${column}=? WHERE id=?`, [arr, userId])
    .then(async () => await getById(userId));
}

export async function update(id, username, url, introduce, alert, tag) {
  return db
    .execute(
      `UPDATE user SET username=?, url=?, introduce=?, alert=?, tag=? WHERE id=?`,
      [username, url, introduce, alert, tag, id]
    )
    .then(async () => await getById(id));
}

export async function updatePw(id, password) {
  return db
    .execute(`UPDATE user SET password=? WHERE id=?`, [password, id])
    .then(async () => await getById(id));
}

export async function findPw(email, password) {
  return db
    .execute(`UPDATE user SET password=? WHERE email=?`, [password, email])
    .then(async () => await getByEmail(email));
}

export async function remove(id) {
  db.execute("DELETE FROM user WHERE id=?", [id]);
}

export async function removeList(userId, column, value) {
  const user = await getById(userId);
  const arr =
    column === "post"
      ? user.post.filter((x) => x !== value)
      : column === "comment"
      ? user.comment.filter((x) => x !== value)
      : user.bookmark.filter((x) => x !== value);
  return db
    .execute(`UPDATE user SET ${column}=? WHERE id=?`, [arr, userId])
    .then(async () => await getById(userId));
}

export async function getPostByBookmark(username) {
  const user = await getByUsername(username);
  const bookmark = user.bookmark;

  if (bookmark.length === 0) {
    return false;
  }

  const sql = "SELECT * FROM post WHERE id IN(?)";
  const res = await db.query(sql, [bookmark], (err, result) => {
    if (err) throw err;
    result;
  });
  return res[0];
}
