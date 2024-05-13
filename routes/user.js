var express = require("express");
var router = express.Router();

const { updateFriendList, getFriendList } = require("../modules/user");

// Middleware
const { checkAccess } = require("../middlewares/auth");

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
