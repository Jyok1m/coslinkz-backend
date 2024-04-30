const mongoose = require("mongoose");

const connectionString = process.env.DB_CONNECTION_STRING;

async function initConnection() {
	try {
		const success = await mongoose.connect(connectionString, { connectTimeoutMS: 2000 });
		if (success) {
			console.log("Connected to DB");
		} else {
			throw new Error("Error");
		}
	} catch (e) {
		console.error(e);
	}
}

Promise.resolve(initConnection());
