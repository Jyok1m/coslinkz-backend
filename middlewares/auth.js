const Token = require("../db/models/Token");
const User = require("../db/models/User");

const { generateToken, verifyToken } = require("../modules/auth");

const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;

async function checkAccess(req, res, next) {
	try {
		const refreshToken = req.headers["refresh"];
		const accessToken = req.headers["access"];

		const accessTokenCheck = verifyToken(accessToken, "ACCESS");
		if (accessTokenCheck.success) {
			const user = await User.findById(accessTokenCheck.userId).select("account");
			if (!user) return res.status(404).json({ success: false, error: "User not found" });

			if (!["/change-password", "/confirm-account"].includes(req.route.path)) {
				const isPending = user.account.registration === "pending";
				if (!isPending) return res.json({ success: false, error: "Account not yet confirmed" });
			}

			req.userId = accessTokenCheck.userId;
			return next();
		} else {
			const refreshTokenCheck = verifyToken(refreshToken, "REFRESH");
			if (refreshTokenCheck.success) {
				const user = await User.findById(refreshTokenCheck.userId).select("account");
				if (!user) return res.status(404).json({ success: false, error: "User not found" });

				if (!["/change-password", "/confirm-account"].includes(req.route.path)) {
					const isPending = user.account.registration === "pending";
					if (!isPending) return res.json({ success: false, error: "Account not yet confirmed" });
				}

				const newAccessToken = generateToken(refreshTokenCheck.userId, "ACCESS");
				await Token.updateOne({ refresh: refreshToken }, { access: newAccessToken });
				req.userId = refreshTokenCheck.userId;
				return next();
			} else {
				return res.json({ success: false, error: "Invalid token" });
			}
		}
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
}

const checkSignUpFields = (req, res, next) => {
	try {
		const fields = ["username", "email", "password"];

		for (const f of fields) {
			const bodyField = req.body[f];

			if (!bodyField) throw new Error("Missing or empty fields");

			switch (f) {
				case "email":
					if (!bodyField.match(emailRegex)) {
						throw new Error("Invalid email");
					} else {
						req[f] = bodyField.toLowerCase();
					}
					break;
				case "password":
					if (!bodyField.match(passwordRegex)) {
						throw new Error("The password must contain at least 8 characters, 1 special, 1 number, 1 upper and 1 lowercase letter");
					} else {
						req[f] = bodyField;
					}
					break;
				default:
					req[f] = bodyField;
					break;
			}
		}

		next();
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
};

module.exports = { checkAccess, checkSignUpFields };
