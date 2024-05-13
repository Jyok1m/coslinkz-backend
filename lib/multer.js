const multer = require("multer");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "/tmp/");
	},
	filename: function (req, file, cb) {
		cb(null, new Date().toISOString() + "-" + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		//reject file
		cb({ message: "Unsupported file format" }, false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	fileSize: 10 * 1024 * 1024,
});

module.exports = upload;
