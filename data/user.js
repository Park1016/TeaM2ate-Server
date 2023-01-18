import express from "express";
import "express-async-errors";
import MongoDb from "mongodb";
import { getUsers } from "../database/database.js";
const ObjectID = MongoDb.ObjectID;

export async function getById(id) {
  return getUsers()
    .find({ _id: new ObjectID(id) })
    .next()
    .then(mapOptionalUser);
}

export async function getByUsername(username) {
  return getUsers() //
    .find({ username })
    .next()
    .then(mapOptionalUser);
}

export async function getByEmail(email) {
  return getUsers() //
    .find({ email })
    .next()
    .then(mapOptionalUser);
}

export async function signUp(user) {
  const { username, password, name, email, url } = user;
  return getUsers()
    .insertOne({
      username,
      password,
      name,
      email,
      url,
      type: "gen",
      introduce: "",
      createdAt: new Date(),
      tag: [],
      bookmark: [],
      post: [],
      comment: [],
      follower: [],
      following: [],
      report: [],
      alert: [],
      send_offer: [],
      get_offer: [],
    })
    .then((result) => console.log(result));
}

export async function addList(id, column, value) {
  const user = await getById(id);
  const arr =
    column === "post"
      ? [value, ...user.post]
      : column === "comment"
      ? [value, ...user.comment]
      : [value, ...user.bookmark];
  return getUsers()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { column: arr } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function update(id, username, url, introduce, alert, tag) {
  return getUsers()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { username, url, introduce, alert, tag } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function updatePw(id, password) {
  return getUsers()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { password } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

export async function findPw(email, password) {
  return getUsers()
    .findOneAndUpdate(
      { email },
      { $set: { password } },
      { returnOriginal: false }
    )
    .then(async () => await getByEmail(email));
}

export async function remove(id) {
  return getUsers().deleteOne({ _id: new ObjectID(id) });
}

export async function removeList(id, column, value) {
  const user = await getById(id);
  const arr =
    column === "post"
      ? user.post.filter((x) => x !== value)
      : column === "comment"
      ? user.comment.filter((x) => x !== value)
      : user.bookmark.filter((x) => x !== value);
  return getUsers()
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { column: arr } },
      { returnOriginal: false }
    )
    .then(async () => await getById(id));
}

function mapOptionalUser(user) {
  return user ? { ...user, id: user._id.toString() } : user;
}
