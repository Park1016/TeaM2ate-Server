import express from "express";
import "express-async-errors";
import MongoDb from "mongodb";
import * as userRepository from "./user.js";
import { getPosts } from "../database/database.js";
const ObjectID = MongoDb.ObjectID;

export async function getByUsername(username) {
  // return database
  //   .execute("SELECT * FROM post WHERE username=?", [username]) //
  //   .then((result) => result[0]);
  return getPosts().find({ username }).next().then(mapOptionalPost);
}

export async function getById(id) {
  // return database
  //   .execute("SELECT * FROM post WHERE id=?", [id]) //
  //   .then((result) => result[0][0]);
  console.log("------", id);
  return getPosts()
    .find({ _id: new ObjectID(id) })
    .next()
    .then(mapOptionalPost);
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
  //   cate,
  //   url,
  //   username,
  //   title,
  //   text,
  //   userId,
  //   tag,
  //   type
  // ) {
  //   return database
  //     .execute(
  //       "INSERT INTO post (title, url, username, text, createdAt, cate, userId, view, tag, type, progress, report) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
  //       [
  //         title,
  //         url,
  //         username,
  //         text,
  //         new Date(),
  //         cate,
  //         userId,
  //         1,
  //         tag,
  //         type,
  //         "ing",
  //         JSON.stringify([]),
  //       ]
  //     )
  //     .then(async (result) => await getById(result[0].insertId));
  return getPosts()
    .insertOne({
      title,
      url,
      username,
      text,
      createdAt: new Date(),
      cate,
      userId,
      view: 1,
      tag,
      type,
      progress: "ing",
      report: [],
    })
    .then(async (result) => await getById(result.insertedId.toString()));
}

export async function addList(id, column, value) {
  // const post = await getById(id);
  // const arr = column === "report" && [value, ...post.report];
  // return database
  //   .execute(`UPDATE post SET ${column}=? WHERE id=?`, [arr, id])
  //   .then(async () => await getById(id));
  return getPosts()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { column: arr } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function update(id, cate, title, text, tag, type, progress) {
  // return database
  //   .execute(
  //     "UPDATE post SET cate=?, title=?, text=?, tag=?, type=?, progress=? WHERE id=?",
  //     [cate, title, text, tag, type, progress, id]
  //   )
  //   .then(async () => await getById(id));
  return getPosts()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { cate, title, text, tag, type, progress } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function remove(id) {
  // database.execute("DELETE FROM post WHERE id=?", [id]);
  return getPosts().deleteOne({ _id: new ObjectID(id) });
}

export async function getPostByBookmark(username) {
  const user = await getByUsername(username);
  const bookmark = user.bookmark;
  if (bookmark.length === 0) {
    return false;
  }
  // const sql = "SELECT * FROM post WHERE id IN(?)";
  // const res = await database.query(sql, [bookmark], (err, result) => {
  //   if (err) throw err;
  //   result;
  // });
  // return res[0];
  return getPosts().find({ _id: bookmark }).next().then(mapPosts);
}

function mapOptionalPost(post) {
  return post ? { ...post, id: post._id.toString() } : post;
}

function mapPosts(posts) {
  return posts.map(mapOptionalPost);
}
