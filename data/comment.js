import express from "express";
import "express-async-errors";
import MongoDb from "mongodb";
import { getComments } from "../database/database.js";
import * as userRepository from "./user.js";
const ObjectID = MongoDb.ObjectID;

export async function getById(id) {
  // return database
  //   .execute("SELECT * FROM comment WHERE id=?", [id]) //
  //   .then((result) => result[0][0]);
  return getComments()
    .find({ _id: new ObjectID(id) })
    .next()
    .then(mapOptionalComment);
}

export async function getByUsername(username) {
  // return database
  //   .execute("SELECT * FROM comment WHERE username=?", [username]) //
  //   .then((result) => result[0]);
  return getComments().find({ username }).next().then(mapOptionalComment);
}

export async function getByPostId(postId) {
  // return database
  //   .execute("SELECT * FROM comment WHERE postId=?", [postId]) //
  //   .then((result) => result[0]);
  return getComments().find({ postId }).next().then(mapOptionalComment);
}

export async function getPostByComment(username) {
  const comment = await getByUsername(username);
  if (comment.length === 0) {
    return false;
  }
  const postId = comment.map((x) => x.postId);
  // const sql = "SELECT * FROM post WHERE id IN(?)";
  // const res = await database.query(sql, [postId], (err, result) => {
  //   if (err) throw err;
  //   result;
  // });
  // const data = { post: res[0], comment };
  // return data;
  return getComments().find({ _id: postId }).next().then(mapComments);
}

export async function create(postId, text, url, userId, username) {
  // return database
  //   .execute(
  //     "INSERT INTO comment (postId, text, createdAt, url, userId, username) VALUES(?,?,?,?,?,?)",
  //     [postId, text, new Date(), url, userId, username]
  //   )
  //   .then(async (result) => await getById(result[0].insertId));
  return getComments()
    .insertOne({
      postId,
      text,
      createdAt: new Date(),
      url,
      userId,
      username,
    })
    .then(async (result) => await getById(result.id));
}

export async function update(id, text) {
  // return database
  //   .execute("UPDATE comment SET text=? WHERE id=?", [text, id])
  //   .then(async () => await getById(id));
  return getComments()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { text } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function remove(id) {
  // return database.execute("DELETE FROM comment WHERE id=?", [id]);
  return getComments().deleteOne({ _id: new ObjectID(id) });
}

function mapOptionalComment(comment) {
  return comment ? { ...comment, id: comment._id.toString() } : comment;
}

function mapComments(comments) {
  return comments.map(mapOptionalComment);
}
