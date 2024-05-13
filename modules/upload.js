const User = require("../db/models/User");

const cloudinary = require("../lib/cloudinary");
const fs = require("fs");

function getCloudinaryPublicId(url = "") {
	if (!url) {
		return { success: false, error: "Invalid url to convert" };
	}

	const parts = url.split("/");

	const publicId = parts
		.slice(parts.indexOf("upload") + 2)
		.join("/")
		.split(".")
		.slice(0, -1)
		.join(".");

	return { success: true, publicId };
}

async function uploadFile(userId = "", filePath = "", fileType = "") {
	try {
		if (!filePath) {
			return { success: false, error: "No file found" };
		} else if (!fileType) {
			return { success: false, error: "No file type provided" };
		}

		// Remove file before uploading
		if (fileType === "avatar") {
			const user = await User.findById(userId).select("avatar");
			if (user.avatar) {
				const { publicId } = getCloudinaryPublicId(user.avatar);
				const remover = async (id) => await cloudinary.remove(id);
				const { success } = await remover(publicId);
				if (!success) {
					return { success: false, error: "An unexpected error occurred. Please try again later" };
				}
			}
		}

		// Upload file
		const uploader = async (path) => await cloudinary.upload(path, `${fileType}s/${userId}`);
		const path = await uploader(filePath);
		fs.unlinkSync(filePath);

		return { success: true, uri: path.url };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { uploadFile };
