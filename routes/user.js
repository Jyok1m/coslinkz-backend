var express = require("express");
var router = express.Router();

const { updateAvatar, updateFriendList } = require("../modules/user");

// Middleware
const { checkAccess } = require("../middlewares/auth");

// File upload
const { uploadFile } = require("../modules/upload");
const upload = require("../lib/multer");

router.post("/avatar", checkAccess, upload.single("avatar"), async (req, res) => {
	try {
		const { userId } = req;

		const upload = await uploadFile(userId, req.file.path, "avatar");
		if (!upload.success) {
			return res.json({ success: false, error: upload.error });
		}

		const update = await updateAvatar(userId, upload.uri);
		if (!update.success) {
			return res.json({ success: false, error: update.error });
		}

		res.json({ ...upload, message: update.message });
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

router.put("/friendship", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { request, username, requestId } = req.query;
		const requestTypes = ["create", "cancel", "accept", "reject"];

		if (typeof request === "string" && requestTypes.includes(request)) {
			const update = await updateFriendList(userId, username, request, requestId);
			if (update.success) {
				return res.json({ ...update });
			} else {
				return res.json({ success: false, error: update.error });
			}
		} else {
			return res.json({ success: false, error: "Invalid request" });
		}
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
