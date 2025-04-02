# Cloud-Based Encrypted File Sharing Platform (Backend)

This repository contains the backend for a secure cloud-based file-sharing platform built using Node.js, Firebase Storage, and AES encryption.

## 🚀 Features
- 🔒 AES encryption for file security
- ☁️ Firebase Storage integration
- 📂 File upload & download with encryption/decryption
- 🛡️ Secure key management

## 📁 Project Structure
/backend
│── encryptFile.js         # Handles file encryption before upload
│── decryptFile.js         # Handles file decryption after download
│── uploadFile.js          # Uploads encrypted files to Firebase
│── downloadFile.js        # Downloads and decrypts files from Firebase
│── firebaseAdmin.js       # Firebase Admin SDK setup for authentication and storage
│── server.js              # Express.js server handling API requests
│── package.json           # Node.js dependencies and project metadata
│── package-lock.json      # Lock file for installed dependencies
│── .env                   # Environment variables (DO NOT SHARE)
│── encryption_keys.json   # Stores encryption keys (DO NOT SHARE)
│── .gitignore             # Specifies files to ignore in Git
│── README.md              # Project documentation

## 🔧 Setup Instructions
1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo

2.Install dependencies
  **In bash**
  npm install

3.Set up Firebase
Update .env with your Firebase Storage bucket name.

4.Run the server
node server.js

📜 License
This project is open-source. Feel free to contribute!
