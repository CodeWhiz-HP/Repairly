import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connnection: ConnectionObject = {}

async function dbConnect() :Promise<void> {
    if(connnection.isConnected){
        console.log("Database is already Connected!");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || "");
        connnection.isConnected = db.connections[0].readyState;
        console.log("Database Connected Sucessfully");
    } catch (err) {
        console.log("Database Connection Failed.",err);
        process.exit(1);
    }
}

export default dbConnect;