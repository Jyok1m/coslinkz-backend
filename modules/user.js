const User = require("../db/models/User");

async function updateAvatar(userId = "", uri = "") {
	try {
		const updatedUser = await User.findByIdAndUpdate(userId, { avatar: uri });
		if (!updatedUser) {
			return { success: false, error: "User not modified" };
		}

		return { success: true, message: "Avatar successfully modified" };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { updateAvatar };
