import express from 'express';
import 'express-async-errors';
import { db } from '../db/database.js';


export async function getBoard() {
    return db
    .execute('SELECT * FROM post WHERE cate=?', ['findTeam'])//
    .then((result) => result[0]); 
}

export async function getBoardByAmount(cate, start, amount) {
    const board = await getBoard();
    return board.slice(start, start+amount);
}