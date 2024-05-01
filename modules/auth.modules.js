const User = require("../db/models/user.model");

const bcrypt = require("bcrypt");

async function createUser(username, email, password) {
	try {
		const userExists = await User.findOne({ username: new RegExp(username, "i") });
		if (userExists) return { success: false, error: "User already exists" };

		const newUser = await new User({ username, email, password: bcrypt.hashSync(password, 10) });
		const createdUser = await newUser.save();

		return { success: true, createdUser };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { createUser };
