const mongoose = require("mongoose").default;

const rightSchema = new mongoose.Schema({
	type: { type: String, required: false, default: "user", enum: ["user", "admin"] },
	registration: { type: String, required: false, default: "pending", enum: ["pending", "confirmed"] },
	confirmationCode: { type: String, required: false, default: "" },
});

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		tempPassword: { type: String, required: false, default: null },
		tempPasswordExp: { type: Date, required: false, default: null },
		avatar: { type: String, required: false, default: "" },
		rights: rightSchema,
		status: { type: String, required: false, default: "offline", enum: ["online", "offline"] },
		friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: false }] || [],
		// Stripe
		customerId: { type: String, required: false, default: "" },
	},
	{
		timestamps: true,
	}
);

const userModel = mongoose.models.users || new mongoose.model("users", userSchema);

module.exports = userModel;
