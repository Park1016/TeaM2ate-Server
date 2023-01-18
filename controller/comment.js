import * as commentRepository from "../data/comment.js";
import * as userRepository from "../data/user.js";

export async function getByUsername(req, res) {
  const username = req.query.username;
  res.status(200).json(username);
}

export async function getPostByComment(req, res) {
  const username = req.params.username;
  const data = await commentRepository.getPostByComment(username);
  res.status(200).json(data);
}

export async function getByPostId(req, res) {
  const postId = req.params.postId;
  const data = await commentRepository.getByPostId(postId);
  res.status(200).json(data);
}

export async function write(req, res) {
  const { postId, text } = req.body;
  const comment = await commentRepository.create(
    postId,
    text,
    req.url,
    req.userId,
    req.username
  );
  res.status(201).json(comment);
  userRepository.addList(req.userId, "comment", comment.id);
}

export async function update(req, res) {
  const id = req.params.id;
  const { text } = req.body;

  const comment = await commentRepository.getById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (comment.userId !== req.userId) {
    return res.sendStatus(403);
  }

  const updated = await commentRepository.update(id, text);
  res.status(200).json(updated);
}

export async function remove(req, res) {
  const id = req.params.id;

  const comment = await commentRepository.getById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (comment.userId !== req.userId) {
    return res.sendStatus(403);
  }

  await commentRepository.remove(id);
  await userRepository.removeList(req.userId, "comment", comment.id);
  res.sendStatus(204);
}
