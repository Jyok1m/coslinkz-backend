const User = require("../db/models/user.model");
const Token = require("../db/models/token.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uid = require("uid2");
const nodemailer = require("nodemailer");
const moment = require("moment");

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

		await sendAccountValidationEmail(createdUser.email, createdUser.rights.confirmationCode);

		return {
			success: true,
			message: "User successfully created",
			accessToken: createdTokens.access,
			refreshToken: createdTokens.refresh,
			isReset: false,
		};
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/* ---------------------------------------------------------------- */
/*                            Verify user                           */
/* ---------------------------------------------------------------- */

async function verifyUser(identifier, password) {
	const now = moment.utc();

	try {
		const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select(
			"_id password tempPassword tempPasswordExp rights"
		);
		if (!user) return { success: false, error: "User not found" };

		let isReset = false;
		const isPasswordValid = bcrypt.compareSync(password, user.password);

		if (!isPasswordValid) {
			if (!user.tempPassword || !user.tempPasswordExp) return { success: false, error: "Invalid password" };

			const isTempPasswordValid = now.isBefore(moment(user.tempPasswordExp)) && bcrypt.compareSync(password, user.tempPassword);
			if (!isTempPasswordValid) {
				return { success: false, error: "Invalid password" };
			} else {
				isReset = true;
			}
		}

		if (user.rights.registration === "pending") return { success: false, error: "Acount not yet confirmed" };

		const tokens = await Token.findOne({ user: user._id });

		if (tokens) {
			const accessTokenCheck = verifyToken(tokens.access, "ACCESS");
			if (accessTokenCheck.success) {
				return { success: true, message: "User successfully logged-in", accessToken: tokens.access, refreshToken: tokens.refresh, isReset };
			}

			const refreshTokenCheck = verifyToken(tokens.refresh, "REFRESH");
			if (refreshTokenCheck.success) {
				const newAccessToken = generateToken(String(user._id), "ACCESS");
				await Token.findByIdAndUpdate(tokens, { access: newAccessToken });

				return { success: true, message: "User successfully logged-in", accessToken: newAccessToken, refreshToken: tokens.refresh, isReset };
			} else {
				const newAccessToken = generateToken(String(user._id), "ACCESS");
				const newRefreshToken = generateToken(String(user._id), "REFRESH");
				await Token.findByIdAndUpdate(tokens, { access: newAccessToken, refresh: newRefreshToken });

				return { success: true, message: "User successfully logged-in", accessToken: newAccessToken, refreshToken: newRefreshToken, isReset };
			}
		} else {
			// Generate new token
			const newAccessToken = generateToken(String(user._id), "ACCESS");
			const newRefreshToken = generateToken(String(user._id), "REFRESH");

			const newTokens = await new Token({ user: user._id, access: newAccessToken, refresh: newRefreshToken });
			const createdTokens = await newTokens.save();

			return {
				success: true,
				message: "User successfully logged-in",
				accessToken: createdTokens.access,
				refreshToken: createdTokens.refresh,
				isReset,
			};
		}
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/* ---------------------------------------------------------------- */
/*                          Reset password                          */
/* ---------------------------------------------------------------- */

async function resetPassword(email) {
	try {
		const user = await User.findOne({ email }).select("email");
		if (!user) return { success: false, error: "User not found" };

		const tempPassword = uid(15);
		const tempPasswordExp = moment.utc().add(15, "minutes").toDate();
		await User.findByIdAndUpdate(String(user._id), { tempPassword: bcrypt.hashSync(tempPassword, 10), tempPasswordExp });

		await sendTemporaryPassword(user.email, tempPassword);

		return { success: true, message: "A new temporary password has been sent to your email" };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/* ---------------------------------------------------------------- */
/*                          Change password                         */
/* ---------------------------------------------------------------- */

async function changePassword(userId, password) {
	try {
		const newPassword = bcrypt.hashSync(password, 10);
		await User.findByIdAndUpdate(userId, { password: newPassword });

		return { success: true, message: "Password changed successfully" };
	} catch (e) {
		return { success: false, error: e.message };
	}
}

/* ---------------------------------------------------------------- */
/*                           Handle tokens                          */
/* ---------------------------------------------------------------- */

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
			return { success: true, userId: decoded.user };
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

async function sendAccountValidationEmail(email, confirmationCode) {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.NODEMAILER_EMAIL,
				pass: process.env.NODEMAILER_PASSWORD,
			},
		});

		const mailOptions = {
			from: process.env.NODEMAILER_EMAIL,
			to: email,
			subject: "Code d'activation CosLinkz",
			html: `
			<body>
				<p>Voici le code d'activation de votre compte CosLinkz : </p>
				<h3>${confirmationCode}</h3>
			</body>
			`,
		};

		await transporter.sendMail(mailOptions);

		return { success: true };
	} catch (e) {
		console.error(error.message);
		return { success: false };
	}
}

async function sendTemporaryPassword(email, tempPassword) {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.NODEMAILER_EMAIL,
				pass: process.env.NODEMAILER_PASSWORD,
			},
		});

		const mailOptions = {
			from: process.env.NODEMAILER_EMAIL,
			to: email,
			subject: "Mot de passe temporaire CosLinkz",
			html: `
			<body>
				<p>Voici votre mot de passe temporaire : </p>
				<h3>${tempPassword}</h3>
			</body>
			`,
		};

		await transporter.sendMail(mailOptions);

		return { success: true };
	} catch (e) {
		console.error(error.message);
		return { success: false };
	}
}

module.exports = { createUser, verifyUser, generateToken, verifyToken, resetPassword, changePassword };
