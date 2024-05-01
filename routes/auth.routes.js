var express = require("express");
var router = express.Router();

// Middlewares
const { checkSignUpFields } = require("../middlewares/auth.middleware");

router.post("/sign-up", checkSignUpFields, async (req, res) => {
	try {
		const { email, username, password } = req;

		res.json({ success: true, req: req.email });
	} catch (e) {
		res.status(500).json({ success: false, error: e.message });
	}
});

module.exports = router;
