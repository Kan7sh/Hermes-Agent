import mongoose from "mongoose";

export async function dbConnection() {
    try {
        await mongoose.connect(process.env.DB_URL as string);
        console.log("Connected!");
    } catch (err) {
        console.error("DB connection Error!", err);
        throw err;
    }
}