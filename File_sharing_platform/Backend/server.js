import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { encryptFile } from "./encryptFile.js";
import { uploadEncryptedFile } from "./uploadFile.js"; // ✅ Ensure correct import
import { downloadAndDecryptFile } from "./downloadFile.js"; // ✅ Ensure correct import
import { storage } from "../firebaseConfig.js";
import { ref, listAll } from "firebase/storage";

async function listFirebaseFiles() {
    const storageRef = ref(storage, "uploads/"); // Change "uploads/" if necessary
    const files = await listAll(storageRef);

    console.log("🔍 Files in Firebase Storage:");
    files.items.forEach((fileRef) => console.log("📂", fileRef.fullPath));
}

listFirebaseFiles();

const app = express();
const port = 3000;

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Set up Multer to accept files from anywhere
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // ✅ Store uploaded files in the `uploads/` folder
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // ✅ Keep original filename
    }
});

const upload = multer({ multerStorage });

// ✅ Upload, Encrypt & Store in Firebase
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded!" });
    }

    const filePath = path.resolve(__dirname, "uploads", req.file.originalname); // ✅ Absolute path
    const fileName = req.file.originalname;

    console.log("📂 File received:", fileName);

    try {
        // ✅ Encrypt and Upload to Firebase
        await uploadEncryptedFile(filePath);
        res.json({
            message: "✅ File uploaded, encrypted & stored successfully in Firebase!",
        });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ error: "Upload failed!" });
    }
});


// ✅ Download & Decrypt File
app.get("/download", async (req, res) => {
    const fileName = req.query.file;
    if (!fileName) return res.status(400).json({ error: "File name required!" });

    const firebasePath = `uploads/encrypted_${fileName}`;
    const decryptedFilePath = path.join(__dirname, "uploads/decrypted_images", `decrypted_${fileName}`);

    try {
        await downloadAndDecryptFile(firebasePath, decryptedFilePath);

        if (!fs.existsSync(decryptedFilePath)) {
            return res.status(404).json({ error: "Decrypted file not found!" });
        }

        res.download(decryptedFilePath, `decrypted_${fileName}`, (err) => {
            if (err) console.error("❌ Download error:", err);
        });
    } catch (error) {
        console.error("❌ Error during download:", error);
        res.status(500).json({ error: "Download failed!" });
    }
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
