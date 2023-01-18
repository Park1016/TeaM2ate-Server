export async function upload(req, res) {
    const file = req.file;
    await photoRepository.upload(file);
    res.sendStatus(204);
}