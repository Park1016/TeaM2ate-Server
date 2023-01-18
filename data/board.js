import express from "express";
import "express-async-errors";
import { getPosts } from "../database/database.js";

export async function getBoard() {
  return getPosts() //
    .find({ cate: "findTeam" })
    .sort({ createdAt: -1 })
    .toArray()
    .then(mapPosts);
}

export async function getBoardByAmount(cate, start, amount) {
  const board = await getBoard();
  return board.slice(start, start + amount);
}

function mapOptionalPost(post) {
  return post ? { ...post, id: post._id.toString() } : post;
}

function mapPosts(posts) {
  return posts.map(mapOptionalPost);
}
