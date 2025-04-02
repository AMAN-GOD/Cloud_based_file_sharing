const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const progressBar = document.getElementById("progressBar");
const downloadButton = document.getElementById("downloadButton");
const fileNameInput = document.getElementById("fileNameInput");

let selectedFile = null;
const backendUrl = "http://localhost:3000"; // Update if needed

// ✅ Handle drag & drop
dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    handleFile(event.dataTransfer.files[0]);
});

// ✅ Handle file selection via click
fileInput.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
});

// ✅ Handle upload button click
uploadButton.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Please select a file first!");
        return;
    }
    uploadButton.disabled = true;
    await uploadFile(selectedFile);
    uploadButton.disabled = false;
});

// ✅ Store the selected file
function handleFile(file) {
    if (!file) return;
    selectedFile = file;
    uploadButton.disabled = false; // Enable upload button
    console.log("Selected file:", file.name);
}

// ✅ Upload file to backend
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    progressBar.style.width = "0%";

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed!");
        }

        console.log("✅ File uploaded and encrypted successfully!");
        progressBar.style.width = "100%";
        alert("File uploaded, encrypted, and stored in Firebase!");
    } catch (error) {
        console.error("❌ Upload error:", error);
        alert("File upload failed.");
    }
}


// ✅ Handle download button click
downloadButton.addEventListener("click", async () => {
    const fileName = fileNameInput.value.trim();
    if (!fileName) {
        alert("Please enter a file name!");
        return;
    }

    downloadButton.disabled = true;
    await downloadFile(fileName);
    downloadButton.disabled = false;
});

// ✅ Download and decrypt file
async function downloadFile(fileName) {
    try {
        const response = await fetch(`${backendUrl}/download?file=${fileName}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Download failed!");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // ✅ Create a link to download the file
        const a = document.createElement("a");
        a.href = url;
        a.download = `decrypted_${fileName}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("✅ File downloaded successfully!");
    } catch (error) {
        console.error("❌ Download error:", error);
        alert(error.message);
    }
}
