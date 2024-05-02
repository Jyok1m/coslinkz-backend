var express = require("express");
var router = express.Router();

// Middlewares
const { checkAccess, checkSignUpFields } = require("../middlewares/auth.middleware");

// Modules
const { createUser, verifyUser, resetPassword, changePassword } = require("../modules/auth.modules");

router.post("/sign-up", checkSignUpFields, async (req, res) => {
	try {
		const { username, email, password } = req;

		const creationResult = await createUser(username, email, password);
		if (!creationResult.success) throw new Error(creationResult.error);

		res.json({ ...creationResult });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

router.post("/sign-in", async (req, res) => {
	try {
		const { identifier, password } = req.body;

		const verificationResult = await verifyUser(identifier, password);
		if (!verificationResult.success) throw new Error(verificationResult.error);

		res.json({ ...verificationResult });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;

		const resetResult = await resetPassword(email);
		if (!resetResult.success) throw new Error(resetResult.error);

		res.json({ ...resetResult });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

router.put("/change-password", checkAccess, async (req, res) => {
	try {
		const { userId } = req;
		const { password } = req.body;

		const changeResult = await changePassword(userId, password);
		if (!changeResult.success) throw new Error(changeResult.error);

		res.json({ ...changeResult });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
