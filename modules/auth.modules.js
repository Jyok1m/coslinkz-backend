const User = require("../db/models/user.model");
const Token = require("../db/models/token.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function createUser(username, email, password) {
	try {
		const userExists = await User.findOne({ username: new RegExp(username, "i") });
		if (userExists) return { success: false, error: "User already exists" };

		const newUser = await new User({ username, email, password: bcrypt.hashSync(password, 10) });
		const createdUser = await newUser.save();
		if (!createdUser) return { success: false, error: "A problem occured while saving the user" };

		// Generate new token
		const newAccessToken = generateToken(String(createdUser._id), "ACCESS");
		const newRefreshToken = generateToken(String(createdUser._id), "REFRESH");

		const newTokens = await new Token({ user: createdUser._id, access: newAccessToken, refresh: newRefreshToken });
		const createdTokens = await newTokens.save();

		return { success: true, accessToken: createdTokens.access, refreshToken: createdTokens.refresh };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

function generateToken(userId, type = "ACCESS") {
	try {
		const expiration = process.env[type + "_EXPIRATION"];
		const secretKey = process.env[type + "_KEY"];

		const newToken = jwt.sign({ user: userId }, secretKey, { expiresIn: expiration });

		return newToken;
	} catch (error) {
		throw new Error(error.message);
	}
}

module.exports = { createUser };
