import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Define __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const algorithm = "aes-256-gcm";

// ✅ Function to encrypt a file
export function encryptFile(inputFilePath, encryptedFilePath) {
    try {
        if (!fs.existsSync(inputFilePath)) {
            console.error("❌ Error: Input file does not exist:", inputFilePath);
            return null;
        }

        // ✅ Ensure the `uploads/encrypted_files/` folder exists
        const encryptedDir = path.dirname(encryptedFilePath);
        if (!fs.existsSync(encryptedDir)) {
            fs.mkdirSync(encryptedDir, { recursive: true });
        }

        const key = crypto.randomBytes(32); // 256-bit key
        const iv = crypto.randomBytes(12); // 96-bit IV (GCM recommended)

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const input = fs.readFileSync(inputFilePath);
        const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // ✅ Save IV, authTag, and encrypted data
        fs.writeFileSync(encryptedFilePath, Buffer.concat([iv, authTag, encrypted]));

        console.log("✅ File encrypted successfully!");
        console.log("🔑 Encryption Key:", key.toString("hex"));
        console.log("🧩 IV:", iv.toString("hex"));
        console.log("🔏 Auth Tag:", authTag.toString("hex"));

        // ✅ Save encryption metadata
        const encryptionData = {
            key: key.toString("hex"),
            iv: iv.toString("hex"),
            authTag: authTag.toString("hex"),
            encryptedFile: encryptedFilePath,
        };

        fs.writeFileSync(
            path.resolve(__dirname, "encryption_keys.json"),
            JSON.stringify(encryptionData, null, 2)
        );

        console.log("📝 Encryption details saved to encryption_keys.json");

        return encryptionData;
    } catch (error) {
        console.error("❌ Error during encryption:", error);
        return null;
    }
}
