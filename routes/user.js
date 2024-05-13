var express = require("express");
var router = express.Router();

const { getProfile, updateProfile, updateAvatar, updateFriendList, getFriendList } = require("../modules/user");

// Middleware
const { checkAccess } = require("../middlewares/auth");
const { checkProfileField } = require("../middlewares/user");

// File upload
const { uploadFile } = require("../modules/upload");
const upload = require("../lib/multer");

// Route to upload / replace new avatar

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

// Route to get profile

router.get("/profile", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { username = "" } = req.query;

		const search = await getProfile(userId, username);
		if (search.success) {
			return res.json({ ...search });
		} else {
			return res.json({ success: false, error: search.error });
		}
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

// Route to update profile

router.put("/profile", checkProfileField, checkAccess, async (req, res) => {
	try {
		const { userId, type, value } = req;

		// Options : email, username, password, bio
		// type, value => req.body (e.g. "email" : "joachim.jasmin@gmail.com" ou "username" : "Jojo")

		const profileUpdate = await updateProfile(userId, type, value);
		res.json({ ...profileUpdate });
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

// Route to handle friendship requests

router.put("/friendship", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { username, requestId, ref } = req.query;
		const refTypes = ["create", "cancel", "accept", "reject"];

		// - Soit ref + username => pour create, cancel
		// - Soit ref + requestId => pour accept, reject

		if (typeof ref === "string" && refTypes.includes(ref)) {
			const update = await updateFriendList(userId, username, ref, requestId);
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

// Route to get friend list

router.get("/friends", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { ref, page = 1 } = req.query;
		const refTypes = ["all", "received", "sent", "confirmed"];

		if (typeof ref === "string" && refTypes.includes(ref)) {
			const result = await getFriendList(userId, ref, page);
			if (result.success) {
				return res.json({ ...result });
			} else {
				return res.json({ success: false, error: result.error });
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
