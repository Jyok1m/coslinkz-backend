const checkCreationFields = (req, res, next) => {
	console.log("req.files", req.files);
	try {
		const fields = ["title", "description"];

		for (const f of fields) {
			const bodyField = req.body[f];

			if (!bodyField) {
				return res.json({ success: false, error: "Missing or empty fields" });
			}
		}

		next();
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
};

module.exports = { checkCreationFields };
