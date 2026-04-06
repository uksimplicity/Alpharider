"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, type UploadedFile } from "@/lib/services";

const extractFileUrl = (item: UploadedFile) => item.url ?? item.secure_url ?? "";

export default function UploadPicturePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const getToken = () => {
    const storedToken = localStorage.getItem("alpharider_token");
    if (storedToken) return storedToken;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isLocalhost ? "local-mock-token" : null;
  };

  useEffect(() => {
    localStorage.removeItem("alpharider_package_image_url");
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return false;

    const token = getToken();
    if (!token) {
      setErrorMessage("Please log in first.");
      return false;
    }

    setIsUploading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const uploaded = await uploadFile(token, selectedFile, "rider-packages");

      const url = extractFileUrl(uploaded);
      if (url) {
        try {
          localStorage.setItem("alpharider_package_image_url", url);
        } catch {
          setErrorMessage(
            "Image uploaded, but preview could not be saved locally due to browser storage limits."
          );
        }
      }
      setStatusMessage("File uploaded successfully.");
      setSelectedFile(null);
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload file."
      );
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = async () => {
    if (isContinuing) return;
    setIsContinuing(true);
    setErrorMessage("");

    try {
      if (selectedFile) {
        const uploaded = await handleUpload();
        if (!uploaded) {
          return;
        }
      } else if (!localStorage.getItem("alpharider_package_image_url")) {
        setErrorMessage("Please choose and upload a package picture first.");
        return;
      }

      router.push("/user/upload-picture-1");
    } finally {
      setIsContinuing(false);
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

        <div className="upload-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected package preview" />
          ) : null}
        </div>

        <div className="upload-actions" style={{ display: "grid", gap: "10px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setSelectedFile(nextFile);

              if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
              }

              if (nextFile) {
                const nextPreview = URL.createObjectURL(nextFile);
                setPreviewUrl(nextPreview);
              } else {
                setPreviewUrl("");
              }
            }}
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
            onClick={() => {
              void handleContinue();
            }}
            disabled={isContinuing}
          >
            {isContinuing ? "Please wait..." : "Continue"}
          </button>
        </div>

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

