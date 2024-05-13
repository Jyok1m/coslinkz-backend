const Creation = require("../db/models/Creation");

async function addCreation(userId = "", title = "", description = "", url = "") {
	try {
		const newCreation = await new Creation({
			creator: userId,
			title,
			description,
			url,
			likes: [],
			comments: [],
			bookmarkedBy: [],
		});

		await newCreation.save();

		return { success: true, message: "Creation successfully uploaded !", newCreation };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { addCreation };
