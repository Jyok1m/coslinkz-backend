var express = require("express");
var router = express.Router();

// Middleware
const { checkAccess } = require("../middlewares/auth");

// File upload
const upload = require("../lib/multer");
const cloudinary = require("../lib/cloudinary");
const fs = require("fs");

router.post("/avatar", checkAccess, upload.single("avatar"), async (req, res) => {
	try {
		const { userId } = req;

		const uploader = async (path) => await cloudinary.uploads(path, `Avatars/${userId}`);
		const path = await uploader(req.files[0].path);
		fs.unlinkSync(req.files[0].path);
		url = path.url;

		// res.json({ ...changeResult });
		res.json({ result: true, message: "Avatar ajouté avec succès !", picture: url });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
