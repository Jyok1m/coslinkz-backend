const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;

const checkProfileField = (req, res, next) => {
	try {
		const isBodyLengthValid = Object.keys(req.body).length === 1;

		if (isBodyLengthValid) {
			const key = Object.keys(req.body)[0];
			const value = req.body[key];

			switch (value) {
				case "email":
					if (value.match(emailRegex)) {
						req.value = value.toLowerCase();
						break;
					} else {
						return res.json({ success: false, error: "Invalid email" });
					}
				case "password":
					if (!value.match(passwordRegex)) {
						return res.json({
							success: false,
							error: "The password must contain at least 8 characters, 1 special, 1 number, 1 upper and 1 lowercase letter",
						});
					}
				default:
					break;
			}

			req.type = key;
			req.value = value;
			next();
		} else {
			return res.json({ success: false, error: "Invalid body" });
		}
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
};

module.exports = { checkProfileField };
