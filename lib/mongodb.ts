import { validateEnv } from "@/helpers/validateEnv";
import { Db, MongoClient } from "mongodb";

validateEnv();

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
const MONGODB_DB: string | undefined = process.env.MONGODB_DB;

//MONGODB CONNCTION CACHE
let cachedClient: MongoClient | null = null;
let cachedDB: Db | null = null;

export async function connectToMongoDB() {

  //IF WE HAVE A CONNECTION, CACHED RETURN IT
  if (cachedClient && cachedDB) {
    return { client: cachedClient, db: cachedDB };
  }

    //IF NO CONNECTION EXIST, CREATE A NEW ONE
    
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI!);
    await cachedClient.connect();
  }

  //GET THE DATABASE
  const db = cachedClient.db(MONGODB_DB);
  cachedDB = db;
  return { client: cachedClient, db };
}
