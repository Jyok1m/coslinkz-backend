var express = require("express");
var router = express.Router();

// Middlewares
const { checkSignUpFields } = require("../middlewares/auth.middleware");

// Modules
const { createUser } = require("../modules/auth.modules");

router.post("/sign-up", checkSignUpFields, async (req, res) => {
	try {
		const { username, email, password } = req;

		const creationResult = await createUser(username, email, password);
		if (!creationResult.success) throw new Error(creationResult.error);

		res.json({ success: true, message: "User successfully created" });
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

module.exports = router;
