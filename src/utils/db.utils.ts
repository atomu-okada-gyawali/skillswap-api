import mongoose from "mongoose";

/**
 * Checks if the current MongoDB connection supports transactions (requires a replica set).
 */
export async function supportsTransactions(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) return false;
    
    // Check using hello (modern) or isMaster (legacy)
    const status = await mongoose.connection.db?.admin().command({ hello: 1 }).catch(() => 
                   mongoose.connection.db?.admin().command({ isMaster: 1 }));
                   
    return !!(status?.setName || status?.isreplicaset || status?.me);
  } catch (error) {
    return false;
  }
}

/**
 * Executes a function within a transaction if supported by the MongoDB environment.
 * If transactions are not supported (e.g., standalone instance in local development),
 * it executes the function without a transaction session.
 */
export async function runInTransaction<T>(
  fn: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> {
  const isSupported = await supportsTransactions();
  
  if (!isSupported) {
    return fn(null);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
