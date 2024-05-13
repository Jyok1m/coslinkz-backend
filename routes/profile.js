var express = require("express");
var router = express.Router();

const { getProfile, updateProfile, updateAvatar } = require("../modules/profile");

// Middleware
const { checkAccess } = require("../middlewares/auth");
const { checkProfileField } = require("../middlewares/profile");

// File upload
const { uploadFile } = require("../modules/upload");
const upload = require("../lib/multer");

// Route to get profile

router.get("/", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { username = "" } = req.query;

		const search = await getProfile(userId, username);
		res.json({ ...search });
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

// Route to update profile

router.put("/update", checkProfileField, checkAccess, async (req, res) => {
	try {
		const { userId, type } = req;

		// Options : email, username, password, bio
		// type, value => req.body (e.g. "email" : "joachim.jasmin@gmail.com" ou "username" : "Jojo")

		const profileUpdate = await updateProfile(userId, type, req.body[type]);
		res.json({ ...profileUpdate });
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

// Route to upload / replace new avatar

router.post("/avatar", checkAccess, upload.single("avatar"), async (req, res) => {
	try {
		const { userId, file } = req;

		if (file) {
			const upload = await uploadFile(userId, file.path, "avatar");
			if (!upload.success) {
				return res.json({ success: false, error: upload.error });
			}

			const update = await updateAvatar(userId, upload.uri);
			if (!update.success) {
				return res.json({ success: false, error: update.error });
			}

			res.json({ ...upload, message: update.message });
		} else {
			return res.json({ success: false, error: "An error with the file occurred" });
		}
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
