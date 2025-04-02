import { storage } from "../firebaseConfig.js";
import { ref, getBytes } from "firebase/storage";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const algorithm = "aes-256-gcm";

// ✅ Set absolute path for encryption keys
const keyFilePath = path.resolve(__dirname, "encryption_keys.json");

// ✅ Ensure the encryption keys file exists
if (!fs.existsSync(keyFilePath)) {
  console.error(`❌ Error: encryption_keys.json not found at ${keyFilePath}!`);
  process.exit(1);
}

// ✅ Function to decrypt a file
export function decryptFile(encryptedContent, key, iv, authTag) {
  try {
    console.log("🔄 Decrypting file...");

    if (!key || key.length !== 32) {
      throw new Error("❌ Invalid or missing decryption key!");
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

    console.log("✅ File decrypted successfully!");
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error.message);
    return null;
  }
}
//To check if the file is present in Firebase Storage
async function fileExistsInFirebase(filePath) {
  const folderRef = ref(storage, "uploads/");
  const list = await listAll(folderRef);

  console.log("🔍 Checking Firebase Storage for:", filePath);
  list.items.forEach((fileRef) => console.log("📂", fileRef.fullPath));

  return list.items.some(item => item.fullPath === filePath);
}

// ✅ Function to download and decrypt file from Firebase
export async function downloadAndDecryptFile(firebasePath, outputFilePath) {
  const storageRef = ref(storage, firebasePath);

  try {
    console.log(`⬇️ Downloading encrypted file from Firebase: ${firebasePath}...`);

    // ✅ Try fetching the file (Handles non-existing files properly)
    let encryptedData;
    try {
      encryptedData = await getBytes(storageRef);
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.error(`❌ File not found in Firebase: ${firebasePath}`);
        return;
      }
      throw error;
    }

    console.log("📄 Encrypted file size:", encryptedData.byteLength, "bytes");

    if (encryptedData.byteLength < 28) {
      throw new Error("❌ Encrypted file is too small to contain necessary metadata.");
    }

    // Convert ArrayBuffer to Buffer
    const encryptedBuffer = Buffer.from(encryptedData);

    // Extract IV, AuthTag, and Encrypted Content
    const iv = encryptedBuffer.slice(0, 12);
    const authTag = encryptedBuffer.slice(12, 28);
    const encryptedContent = encryptedBuffer.slice(28);

    console.log(`🧩 Extracted IV: ${iv.toString("hex")}`);
    console.log(`🔏 Extracted AuthTag: ${authTag.toString("hex")}`);
    console.log(`📦 Encrypted Content Length: ${encryptedContent.length} bytes`);

    if (encryptedContent.length % 16 !== 0) {
      console.warn("⚠️ Warning: Encrypted data length is not a multiple of 16 bytes.");
    }

    // ✅ Read Key from JSON
    console.log(`🔍 Checking encryption key file at: ${keyFilePath}`);
    if (!fs.existsSync(keyFilePath)) {
      throw new Error(`❌ Encryption key file not found at ${keyFilePath}`);
    }

    const encryptionData = JSON.parse(fs.readFileSync(keyFilePath, "utf-8"));
    console.log("🔍 Debugging encryption data:", encryptionData);

    if (!encryptionData.key) {
      throw new Error("❌ Key is missing from encryption_keys.json!");
    }

    if (!encryptionData.iv || !encryptionData.authTag) {
      throw new Error("❌ Missing IV or AuthTag in encryption_keys.json.");
    }

    const key = Buffer.from(encryptionData.key, "hex");
    console.log("🔑 Using stored Key:", encryptionData.key);

    // ✅ Validate Key Length
    if (key.length !== 32) {
      throw new Error(`❌ Invalid key length: Expected 32 bytes, got ${key.length} bytes.`);
    }

    // ✅ Decrypt the file
    const decryptedData = decryptFile(encryptedContent, key, iv, authTag);
    if (!decryptedData) {
      throw new Error("❌ Decryption failed!");
    }

    // ✅ Ensure the decrypted_images folder exists
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // ✅ Save decrypted file
    fs.writeFileSync(outputFilePath, decryptedData);
    console.log("✅ File decrypted successfully and saved as:", outputFilePath);
  } catch (error) {
    console.error("❌ Error downloading or decrypting file:", error);
  }
}
