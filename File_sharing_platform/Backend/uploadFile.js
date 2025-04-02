import { storage } from "../firebaseConfig.js";
import { ref, uploadBytes } from "firebase/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { encryptFile } from "./encryptFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Function to upload encrypted file to Firebase
export async function uploadEncryptedFile(filePath) {
    const fileName = path.basename(filePath); // Extract file name
    // ✅ Ensure "encrypted_" is only added once
    const encryptedFileName = fileName.startsWith("encrypted_") ? fileName : `encrypted_${fileName}`;
    const encryptedFilePath = path.resolve(__dirname, "uploads", encryptedFileName);

    console.log("📂 Checking if the uploaded file exists:", filePath);
    if (!fs.existsSync(filePath)) {
        console.error("❌ Error: Uploaded file does not exist:", filePath);
        return;
    }

    console.log("🔒 Encrypting the uploaded file...");
    const encryptionData = encryptFile(filePath, encryptedFilePath);

    if (!encryptionData) {
        console.error("❌ Error: Encryption failed. Skipping upload.");
        return;
    }

    console.log("✅ Encryption complete. Checking if encrypted file exists...");
    if (!fs.existsSync(encryptedFilePath)) {
        console.error("❌ Error: Encrypted file was not created!");
        return;
    }

    console.log(`📂 Encrypted file exists at: ${encryptedFilePath}`);

    // ✅ Read the encrypted file
    console.log("📄 Reading encrypted file...");
    const fileData = fs.readFileSync(encryptedFilePath);

    // ✅ Set Firebase Storage path
    const firebasePath = `uploads/encrypted_${fileName}`; // Ensure the file has an extension!
    const storageRef = ref(storage, firebasePath);

    try {
        console.log(`⬆️ Uploading file to Firebase Storage: ${firebasePath}`);
        await uploadBytes(storageRef, fileData);
        console.log(`✅ Successfully uploaded to Firebase: ${firebasePath}`);
    } catch (error) {
        console.error("❌ Firebase Upload Error:", error);
    }
}
