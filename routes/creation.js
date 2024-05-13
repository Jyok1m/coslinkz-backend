var express = require("express");
var router = express.Router();

const { addCreation } = require("../modules/creation");

// Middleware
const { checkAccess } = require("../middlewares/auth");
const { checkCreationFields } = require("../middlewares/creation");

// File upload
const { uploadFile } = require("../modules/upload");
const upload = require("../lib/multer");

router.post("/", upload.any(), checkCreationFields, checkAccess, async (req, res) => {
	try {
		const { userId, files } = req;
		const { title, description } = req.body;

		if (files.length > 0) {
			const getCreationUrl = await uploadFile(userId, files[0].path, "creation");

			if (getCreationUrl.success) {
				const saveCreation = await addCreation(userId, title, description, getCreationUrl.uri);
				return res.json({ ...saveCreation });
			} else {
				return res.json({ success: false, error: upload.error });
			}
		} else {
			return res.json({ success: false, error: "An error with the file occurred" });
		}
	} catch (e) {
		console.error(e); // Log the error for debugging
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
