const mongoose = require("mongoose").default;

const likeSchema = new mongoose.Schema({
	liker: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
	date: { type: Date },
});

const commentSchema = new mongoose.Schema({
	writer: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
	likes: [likeSchema],
	date: { type: Date },
});

const creationSchema = new mongoose.Schema(
	{
		creator: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
		title: { type: String },
		description: { type: String },
		url: { type: String },
		likes: [likeSchema],
		comments: [commentSchema],
		bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: false }],
		isHidden: { type: Boolean, required: false, default: false },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.models.creations || new mongoose.model("creations", creationSchema);
