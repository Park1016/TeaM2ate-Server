import express from "express";
import "express-async-errors";
import * as userRepository from "./user.js";
import { db } from "../db/database.js";

export async function create(email, authNum) {
  return db
    .execute("INSERT INTO email (email, authNum, validTime) VALUES(?,?,?)", [
      email,
      authNum,
      new Date().toLocaleTimeString("it-IT"),
    ])
    .then(async () => await getByEmail(email));
}

export async function update(email, authNum) {
  return db
    .execute(`UPDATE email SET authNum=?, validTime=? WHERE email=?`, [
      authNum,
      new Date().toLocaleTimeString("it-IT"),
      email,
    ])
    .then(async () => await getByEmail(email));
}

export async function getByEmail(email) {
  return db
    .execute("SELECT * FROM email WHERE email=?", [email]) //
    .then((result) => result[0][0]);
}

export async function checkValidTime(time) {
  const sql = "SELECT TIMEDIFF(CURRENT_TIME(), ?)";
  const res = await db.query(sql, [time], (err, result) => {
    if (err) throw err;
    result;
  });
  return Object.values(res[0][0])[0];
}
