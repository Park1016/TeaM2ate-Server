import express from "express";
import "express-async-errors";
import MongoDb from "mongodb";
import * as userRepository from "./user.js";
import { getEmails } from "../database/database.js";

export async function create(email, authNum) {
  return getEmails()
    .insertOne({
      email,
      authNum,
      validTime: new Date().toLocaleTimeString("it-IT"),
    })
    .then(async () => await getByEmail(email));
}

export async function update(email, authNum) {
  return getEmails()
    .findOneAndUpdate(
      { email },
      {
        $set: {
          authNum,
          validTime: new Date().toLocaleTimeString("it-IT"),
          email,
        },
      },
      { returnOriginal: false }
    )
    .then(async () => await getByEmail(email));
}

export async function getByEmail(email) {
  return getEmails().find({ email }).next().then(mapOptionalUser);
}

export async function checkValidTime(time) {
  // const sql = "SELECT TIMEDIFF(CURRENT_TIME(), ?)";
  // const res = await database.query(sql, [time], (err, result) => {
  //   if (err) throw err;
  //   result;
  // });
  // return Object.values(res[0][0])[0];
}

function mapOptionalUser(user) {
  return user ? { ...user, id: user._id.toString() } : user;
}
