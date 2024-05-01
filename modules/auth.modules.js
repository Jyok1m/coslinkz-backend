const { ObjectId } = require("mongoose").Types;

const User = require("../db/models/user.model");
const Token = require("../db/models/token.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uid = require("uid2");

/* ---------------------------------------------------------------- */
/*                            Create user                           */
/* ---------------------------------------------------------------- */

async function createUser(username, email, password) {
	try {
		const userExists = await User.findOne({ username: new RegExp(username, "i") });
		if (userExists) return { success: false, error: "User already exists" };

		const newUser = await new User({
			username,
			email,
			password: bcrypt.hashSync(password, 10),
			rights: { type: "user", registration: "pending", confirmationCode: uid(5) },
		});
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

/* ---------------------------------------------------------------- */
/*                            Verify user                           */
/* ---------------------------------------------------------------- */

async function verifyUser(identifier, password) {
	try {
		const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select("_id password");
		if (!user) return { success: false, error: "User not found" };

		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) return { success: false, error: "Invalid password" };

		const tokens = await Token.findOne({ user: user._id });

		if (tokens) {
			const accessTokenCheck = verifyToken(tokens.access, "ACCESS");
			if (accessTokenCheck.success) return { success: true, accessToken: tokens.access, refreshToken: tokens.refresh };

			const refreshTokenCheck = verifyToken(tokens.refresh, "REFRESH");
			if (refreshTokenCheck.success) {
				const newAccessToken = generateToken(String(user._id), "ACCESS");
				await Token.findByIdAndUpdate(tokens, { access: newAccessToken });

				return { success: true, accessToken: newAccessToken, refreshToken: tokens.refresh };
			} else {
				const newAccessToken = generateToken(String(user._id), "ACCESS");
				const newRefreshToken = generateToken(String(user._id), "REFRESH");
				await Token.findByIdAndUpdate(tokens, { access: newAccessToken, refresh: newRefreshToken });

				return { success: true, accessToken: newAccessToken, refreshToken: newRefreshToken };
			}
		} else {
			// Generate new token
			const newAccessToken = generateToken(String(user._id), "ACCESS");
			const newRefreshToken = generateToken(String(user._id), "REFRESH");

			const newTokens = await new Token({ user: user._id, access: newAccessToken, refresh: newRefreshToken });
			const createdTokens = await newTokens.save();

			return { success: true, accessToken: createdTokens.access, refreshToken: createdTokens.refresh };
		}
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/* ---------------------------------------------------------------- */
/*                           Handle tokens                          */
/* ---------------------------------------------------------------- */

async function verifyToken(userId = new ObjectId()) {
	try {
		const tokens = await Token.findOne({ user: userId });
		if (!tokens) {
			// Generate new token
			const newAccessToken = generateToken(String(userId), "ACCESS");
			const newRefreshToken = generateToken(String(userId), "REFRESH");

			const newTokens = await new Token({ user: userId, access: newAccessToken, refresh: newRefreshToken });
			const createdTokens = await newTokens.save();

			return { success: true, accessToken: createdTokens.access, refreshToken: createdTokens.refresh };
		} else {
			return { success: false };
		}
	} catch (error) {
		return { success: false, error: error.message };
	}
}

function generateToken(userId, type = "") {
	try {
		const expiration = process.env[type + "_EXPIRATION"];
		const secretKey = process.env[type + "_KEY"];

		const newToken = jwt.sign({ user: userId }, secretKey, { expiresIn: expiration });

		return newToken;
	} catch (error) {
		return { success: false, error: error.message };
	}
}

function verifyToken(token, type = "") {
	try {
		const secretKey = process.env[type + "_KEY"];

		const decoded = jwt.verify(token, secretKey);

		if (decoded.user) {
			return { success: true };
		} else {
			return { success: false };
		}
	} catch (error) {
		console.error(error.message);
		return { success: false };
	}
}

/* ---------------------------------------------------------------- */
/*                           Handle emails                          */
/* ---------------------------------------------------------------- */

module.exports = { createUser, verifyUser };
