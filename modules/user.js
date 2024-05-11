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

async function updateFriendList(userId = "", username = "", requestType = "", requestId = "") {
	try {
		if (["accept", "reject"].includes(requestType)) {
			if (requestId) {
				const friendship = await Friendship.findById(requestId);

				if (friendship) {
					const { status, sender, receiver } = friendship;
					const isReceiver = userId === friendship.receiver.toString();

					if (isReceiver) {
						if (status === "pending") {
							if (requestType === "accept") {
								Promise.allSettled([
									Friendship.findByIdAndUpdate(friendship._id, { status: "confirmed" }),
									User.findByIdAndUpdate(sender, { $addToSet: { friends: receiver } }),
									User.findByIdAndUpdate(receiver, { $addToSet: { friends: sender } }),
								]);

								return { success: true, error: "Friendship successfully validated" };
							} else {
								Promise.allSettled([
									Friendship.findByIdAndUpdate(friendship._id, { status: "cancelled" }),
									User.findByIdAndUpdate(sender, { $pull: { friends: receiver } }),
									User.findByIdAndUpdate(receiver, { $pull: { friends: sender } }),
								]);

								return { success: true, error: "Friendship successfully rejected" };
							}
						} else {
							return { success: false, error: "Friendship request already handled" };
						}
					} else {
						return { success: false, error: "Not allowed" };
					}
				} else {
					return { success: false, error: "Friendship request not found" };
				}
			} else {
				return { success: false, error: "Friendship request ID missing" };
			}
		} else {
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
						const { status, sender, receiver } = friendship;

						if (status !== "locked") {
							if (requestType === "create") {
								if (status === "cancelled") {
									await Friendship.findByIdAndUpdate(friendship._id, { sender: userId, receiver: target._id, status: "pending" });

									return { success: true, message: "Friendship request successfully sent" };
								} else if (status === "pending") {
									return { success: false, error: "Friend request already awaiting confirmation" };
								} else if (status === "confirmed") {
									return { success: false, error: "Friend already in your list" };
								}
							} else {
								if (status !== "cancelled") {
									if (status === "confirmed") {
										Promise.allSettled([
											User.findByIdAndUpdate(sender, { $pull: { friends: receiver } }),
											User.findByIdAndUpdate(receiver, { $pull: { friends: sender } }),
										]);
									}

									await Friendship.findByIdAndUpdate(friendship._id, { status: "cancelled" });

									return { success: true, message: "Friendship successfully cancelled" };
								} else {
									return { success: false, error: "Person already cancelled" };
								}
							}
						} else {
							return { success: false, error: "Operation forbidden. Please contact the support team" };
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
				return { success: false, error: "Username missing" };
			}
		}
	} catch (e) {
		return { success: false, error: e.message };
	}
}

module.exports = { updateAvatar, updateFriendList };
