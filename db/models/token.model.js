const mongoose = require("mongoose").default;

const tokenSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
		refresh: { type: String, required: true },
		access: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

const tokenModel = mongoose.models.tokens || new mongoose.model("tokens", tokenSchema);

module.exports = tokenModel;
