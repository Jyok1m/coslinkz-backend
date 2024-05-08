const cloudinary = require("../lib/cloudinary");
const fs = require("fs");

async function uploadFile(userId = "", filePath = "", fileType = "") {
	try {
		if (!filePath) {
			return { success: false, error: "No file found" };
		} else if (!fileType) {
			return { success: false, error: "No file type provided" };
		}

		const uploader = async (path) => await cloudinary.uploads(path, `${fileType}s/${userId}`);
		const path = await uploader(filePath);
		fs.unlinkSync(filePath);

		return { success: true, uri: path.url };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { uploadFile };
