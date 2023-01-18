import express from "express";
import "express-async-errors";
import * as userRepository from "./user.js";
import { db } from "../db/database.js";

export async function getByUsername(username) {
  return db
    .execute("SELECT * FROM post WHERE username=?", [username]) //
    .then((result) => result[0]);
}

export async function getById(id) {
  return db
    .execute("SELECT * FROM post WHERE id=?", [id]) //
    .then((result) => result[0][0]);
}

export async function create(
  cate,
  url,
  username,
  title,
  text,
  userId,
  tag,
  type
) {
  return db
    .execute(
      "INSERT INTO post (title, url, username, text, createdAt, cate, userId, view, tag, type, progress, report) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        title,
        url,
        username,
        text,
        new Date(),
        cate,
        userId,
        1,
        tag,
        type,
        "ing",
        JSON.stringify([]),
      ]
    )
    .then(async (result) => await getById(result[0].insertId));
}

export async function addList(id, column, value) {
  const post = await getById(id);
  const arr = column === "report" && [value, ...post.report];
  return db
    .execute(`UPDATE post SET ${column}=? WHERE id=?`, [arr, id])
    .then(async () => await getById(id));
}

export async function update(id, cate, title, text, tag, type, progress) {
  return db
    .execute(
      "UPDATE post SET cate=?, title=?, text=?, tag=?, type=?, progress=? WHERE id=?",
      [cate, title, text, tag, type, progress, id]
    )
    .then(async () => await getById(id));
}

export async function remove(id) {
  db.execute("DELETE FROM post WHERE id=?", [id]);
}
