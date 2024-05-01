const emailRegex = new RegExp(process.env.EMAIL_REGEX);
const passwordRegex = new RegExp(process.env.PASSWORD_REGEX);

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
						throw new Error("The password must contain at least 8 characters, 1 number, 1 upper and 1 lowercase letter");
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

module.exports = { checkSignUpFields };
