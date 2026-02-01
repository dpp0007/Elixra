import { MongoClient, Db } from 'mongodb'

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  // Return a rejected promise if the environment variable is missing
  // This prevents build-time crashes when the variable isn't set,
  // while still providing a clear error if the database is actually accessed.
  clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'))
} else {
  const uri = process.env.MONGODB_URI
  const options = {}

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('chemlab-online')
}

export default clientPromise
