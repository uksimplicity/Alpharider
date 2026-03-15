"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFile, listFiles, uploadFile, type UploadedFile } from "@/lib/upload-api";

const extractFileIdentity = (item: UploadedFile) =>
  item.id ?? item.file_id ?? item.public_id ?? "";

const extractFileUrl = (item: UploadedFile) => item.url ?? item.secure_url ?? "";

export default function UploadPicturePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadFiles = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setErrorMessage("Please log in first.");
        setIsLoadingFiles(false);
        return;
      }

      setIsLoadingFiles(true);
      try {
        const files = await listFiles(token, "rider-packages");
        setUploadedFiles(files);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load files."
        );
      } finally {
        setIsLoadingFiles(false);
      }
    };

    void loadFiles();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const uploaded = await uploadFile(token, selectedFile, "rider-packages");
      setUploadedFiles((prev) => [uploaded, ...prev]);

      const url = extractFileUrl(uploaded);
      if (url) {
        localStorage.setItem("alpharider_package_image_url", url);
      }
      setStatusMessage("File uploaded successfully.");
      setSelectedFile(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload file."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    const id = extractFileIdentity(file);
    if (!id) {
      setErrorMessage("File ID is missing for deletion.");
      return;
    }

    try {
      await deleteFile(token, id);
      setUploadedFiles((prev) =>
        prev.filter((entry) => extractFileIdentity(entry) !== id)
      );
      setStatusMessage("File deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete file."
      );
    }
  };

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card">
        <header className="user-page-header">
          <button
            className="user-header-button"
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <img className="user-header-logo" src="/logo.png" alt="AlphaRide" />
          <span className="user-header-spacer" />
        </header>

        <h1 className="user-page-title">Upload Picture</h1>

        <div className="upload-text">
          <h2>A picture of the package</h2>
          <p>Please upload a picture of your package.</p>
        </div>

        <div className="upload-actions" style={{ display: "grid", gap: "10px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <button
            className="user-primary-button"
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Selected File"}
          </button>
          <button
            className="user-secondary-button"
            type="button"
            onClick={() => router.push("/user/upload-picture-1")}
          >
            Continue
          </button>
        </div>

        {isLoadingFiles ? <p className="helper">Loading uploaded files...</p> : null}
        {uploadedFiles.length > 0 ? (
          <div className="settings-list">
            {uploadedFiles.slice(0, 5).map((file, index) => (
              <button
                key={`${extractFileIdentity(file)}-${index}`}
                className="settings-item"
                type="button"
                onClick={() => {
                  const url = extractFileUrl(file);
                  if (url) {
                    localStorage.setItem("alpharider_package_image_url", url);
                    setStatusMessage("Selected image for preview.");
                  }
                }}
              >
                {file.name ?? extractFileIdentity(file) ?? `File ${index + 1}`}
              </button>
            ))}
            <button
              className="settings-item danger"
              type="button"
              onClick={() => {
                const first = uploadedFiles[0];
                if (first) {
                  void handleDelete(first);
                }
              }}
            >
              Delete First File
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="helper danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {statusMessage ? <p className="helper met">{statusMessage}</p> : null}
      </div>
    </div>
  );
}
