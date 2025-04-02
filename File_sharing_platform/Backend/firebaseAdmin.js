import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config(); // Load environment variables

// Load Firebase credentials from service account file
const serviceAccount = JSON.parse(readFileSync("serviceAccountKey.json", "utf-8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Defined in .env file
});

const bucket = admin.storage().bucket();

export { bucket, admin };
