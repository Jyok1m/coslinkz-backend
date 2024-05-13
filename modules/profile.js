const User = require("../db/models/User");

const bcrypt = require("bcrypt");

async function getProfile(userId = "", username = "") {
	try {
		let query = {};
		let isOwn = false;

		if (username) {
			query = { username: { $regex: new RegExp(username, "i") } };
		} else {
			isOwn = true;
			query = { _id: userId };
		}

		let selectParams = "-_id username avatar bio status createdAt";

		if (isOwn) {
			selectParams = "-_id username email avatar bio status createdAt";
		}

		const profile = await User.findOne(query).select(selectParams);

		if (!profile) {
			return { success: false, error: "No profile found" };
		}

		return { success: true, profile };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

async function updateProfile(userId = "", type = "", value = "") {
	try {
		if (["bio", "username", "email"].includes(type)) {
			await User.findByIdAndUpdate(userId, { [type]: value });
			return { success: true, message: "Profile successfully updated" };
		} else if (type === "password") {
			const user = await User.findById(userId).select("password");
			const isPasswordMatch = bcrypt.compareSync(value, user.password);

			if (!isPasswordMatch) {
				await User.findByIdAndUpdate(userId, { [type]: bcrypt.hashSync(value, 10) });
				return { success: true, message: "Password successfully updated" };
			} else {
				return { success: false, error: "The old and new passwords cannot be the same" };
			}
		} else {
			return { success: false, error: "Invalid query" };
		}
	} catch (e) {
		return { success: false, error: e.message };
	}
}

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

module.exports = { getProfile, updateProfile, updateAvatar };
