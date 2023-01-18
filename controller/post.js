import * as postRepository from "../data/post.js";
import * as userRepository from "../data/user.js";

export async function getByUsername(req, res) {
  const username = req.query.username;
  const data = await postRepository.getByUsername(username);
  return res.status(200).json(data);
}

export async function getById(req, res) {
  const id = req.params.id;
  const data = await postRepository.getById(id);
  if (data) {
    return res.status(200).json(data);
  } else {
    return res.status(404).json({ message: "게시글이 없습니다" });
  }
}

export async function write(req, res) {
  const { cate, title, text, tag, type } = req.body;
  const post = await postRepository.create(
    cate,
    req.url,
    req.username,
    title,
    text,
    req.userId,
    tag,
    type
  );
  await userRepository.addList(req.userId, "post", post.id);
  return res.status(201).json(post);
}

export async function update(req, res) {
  const id = req.params.id;
  const { cate, title, text, tag, type, progress } = req.body;

  const post = await postRepository.getById(id);
  if (!post) {
    return res.sendStatus(404);
  }
  // 게시글 작성자와 현재 로그인한 유저가 다르다면 수정 권한이 없음
  if (post.userId !== req.userId) {
    return res.sendStatus(403);
  }

  const updated = await postRepository.update(
    id,
    cate,
    title,
    text,
    tag,
    type,
    progress
  );
  return res.status(200).json(updated);
}

export async function addList(req, res) {
  const id = req.params.id;
  const { column } = req.body;

  const post = await postRepository.addList(id, column);
  if (post) {
    return res.status(200).json(post);
  } else {
    return res.status(404).json({ message: "요청 실패" });
  }
}

export async function remove(req, res) {
  const id = req.params.id;

  const post = await postRepository.getById(id);
  if (!post) {
    return res.sendStatus(404);
  }
  if (post.userId !== req.userId) {
    return res.sendStatus(403);
  }

  await postRepository.remove(id);
  await userRepository.removeList(req.userId, "post", post.id);
  return res.sendStatus(204);
}
