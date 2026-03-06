const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB:", MONGODB_URI);
    
    const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
    console.log("isMaster result:", JSON.stringify(isMaster, null, 2));
    
    const hasSetName = !!isMaster.setName;
    const hasIsReplicaSet = !!isMaster.isreplicaset;
    console.log("hasSetName:", hasSetName);
    console.log("hasIsReplicaSet:", hasIsReplicaSet);
    
    try {
      const session = await mongoose.startSession();
      console.log("startSession SUCCESS");
      try {
        session.startTransaction();
        console.log("startTransaction SUCCESS");
        await session.abortTransaction();
      } catch (e) {
        console.log("startTransaction FAILED:", e.message);
      } finally {
        await session.endSession();
      }
    } catch (e) {
        console.log("startSession FAILED:", e.message);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Check failed:", error.message);
  }
}

check();
