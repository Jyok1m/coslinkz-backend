const User = require("../db/models/User");
const Friendship = require("../db/models/Friendship");

/* ---------------------------------------------------------------- */
/*                           Handle avatar                          */
/* ---------------------------------------------------------------- */

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

/* ---------------------------------------------------------------- */
/*                        Handle friend list                        */
/* ---------------------------------------------------------------- */

async function updateFriendList(userId = "", username = "", requestType = "") {
	try {
		if (username) {
			const target = await User.findOne({ username: { $regex: new RegExp(username, "i") } }).select("_id");
			if (target) {
				const friendship = await Friendship.findOne({
					$or: [
						{ sender: userId, receiver: target._id },
						{ sender: target._id, receiver: userId },
					],
				});

				if (friendship) {
					const { status } = friendship;
					if (status === "locked") {
						return { success: false, error: "Operation forbidden. Please contact the support team" };
					} else if (requestType === "create") {
						if (status === "pending") {
							return { success: false, error: "Friend request already awaiting confirmation" };
						} else if (status === "confirmed") {
							return { success: false, error: "Friend already in your list" };
						} else {
							await Friendship.findByIdAndUpdate(friendship._id, { sender: userId, receiver: target._id, status: "pending" });
							return { success: true, message: "Friendship request successfully sent" };
						}
					} else {
						if (status === "cancelled") {
							return { success: false, error: "Person already cancelled" };
						} else {
							if (status === "confirmed") {
								await User.updateMany({ $or: [{ _id: userId }, { _id: target._id }] }, { $pull: { friendships: friendship._id } });
							}
							await Friendship.findByIdAndUpdate(friendship._id, { sender: userId, receiver: target._id, status: "cancelled" });
							return { success: true, message: "Friendship successfully cancelled" };
						}
					}
				} else {
					if (requestType === "create") {
						const newFriendship = await new Friendship({ sender: userId, receiver: target._id, status: "pending" });
						await newFriendship.save();
						return { success: true, message: "Friendship request successfully sent" };
					} else {
						return { success: false, error: "No friendship found" };
					}
				}
			} else {
				return { success: false, error: "Target user not found" };
			}
		} else {
			return { success: false, error: "Missing username" };
		}
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { updateAvatar, updateFriendList };
