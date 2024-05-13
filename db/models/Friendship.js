const mongoose = require("mongoose").default;

const friendshipSchema = new mongoose.Schema(
	{
		sender: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
		receiver: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
		status: { type: String, required: false, default: "pending", enum: ["pending", "confirmed", "cancelled", "locked"] },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.models.friendships || new mongoose.model("friendships", friendshipSchema);
