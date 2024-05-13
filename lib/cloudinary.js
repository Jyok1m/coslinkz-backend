const cloudinary = require("cloudinary");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.upload = (file, folder) => {
	return new Promise((resolve, reject) => {
		const transformation = {
			quality: 100,
			fetch_format: "auto",
		};

		cloudinary.uploader.upload(
			file,
			(result) => {
				resolve({
					url: result.url,
					id: result.public_id,
				});
			},
			{
				resource_type: "auto",
				folder: folder,
				transformation: transformation,
			}
		);
	});
};

exports.remove = (publicId = "") => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.destroy(publicId, (result) => {
			console.log("done");
			resolve({ success: true, message: "File removed" });
		});
	});
};
