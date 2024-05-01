var express = require("express");
var router = express.Router();

// Middlewares
const { checkSignUpFields } = require("../middlewares/auth.middleware");

// Modules
const { createUser, verifyUser } = require("../modules/auth.modules");

router.post("/sign-up", checkSignUpFields, async (req, res) => {
	try {
		const { username, email, password } = req;

		const creationResult = await createUser(username, email, password);
		if (!creationResult.success) throw new Error(creationResult.error);

		const { accessToken, refreshToken } = creationResult;

		res.json({ success: true, message: "User successfully created", accessToken, refreshToken });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

router.post("/sign-in", async (req, res) => {
	try {
		const { identifier, password } = req.body;

		const verificationResult = await verifyUser(identifier, password);
		if (!verificationResult.success) throw new Error(verificationResult.error);

		const { accessToken, refreshToken } = verificationResult;

		res.json({ success: true, message: "User successfully logged-in", accessToken, refreshToken });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
