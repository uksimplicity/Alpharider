"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import RiderShell, { Message, riderStyles as styles } from "@/app/components/RiderShell";
import RiderAvailability from "@/app/components/RiderAvailability";
import { useBackend, useWrite } from "@/lib/hooks/use-backend";
import { accountRequest, checkSession, currentToken } from "@/lib/account-client";
import { normalizeProfile, profileName, record, text } from "@/lib/backend-data";
import { documentError, uploadRiderDocuments, type DocumentCache } from "@/lib/rider-documents";
import { riderAccess, riderApprovalMessage, riderDetails, riderProfileMissing } from "@/lib/rider-access";

export default function RiderPage() {
  const profile = useBackend("/user/profile"), rider = useBackend("/rider/profile"), save = useWrite();
  const [vehicleType, setVehicleType] = useState(""), [vehicleNumber, setVehicleNumber] = useState(""), [vehicleModel, setVehicleModel] = useState("");
  const [documents, setDocuments] = useState<File[]>([]), [validationError, setValidationError] = useState(""), [success, setSuccess] = useState("");
  const uploadCache = useRef<DocumentCache>(new Map());
  let user = {}, profileError = profile.error;
  try { if (profile.data) user = normalizeProfile(profile.data); } catch (cause) { profileError = cause instanceof Error ? cause.message : "Could not read profile."; }
  const details = riderDetails(rider.data), person = record(user);
  const missing = riderProfileMissing(rider.errorStatus, rider.error);
  const approval = rider.data ? riderAccess(rider.data).approval : success ? "pending" : missing ? "missing" : null;
  const existingDocuments = Array.isArray(details.documents) ? details.documents.map(value => typeof value === "string" ? value : text(record(value).url)).filter(Boolean) : [];
  const registered = Boolean(rider.data) || Boolean(success);
  const submit = () => {
    if (registered || rider.loading || !missing || !["Bike", "Car", "Van"].includes(vehicleType) || !vehicleNumber.trim()) return;
    const invalid = documents.map(documentError).find(Boolean);
    if (invalid) { setValidationError(invalid); return; }
    setValidationError(""); setSuccess("");
    void save.run(async () => {
      const token = currentToken();
      const urls = await uploadRiderDocuments(documents, token, uploadCache.current);
      checkSession(token);
      const allDocuments = [...new Set([...existingDocuments, ...urls])];
      await accountRequest("/rider/kyc", { method: "POST", body: JSON.stringify({ vehicle_type: vehicleType.trim(), vehicle_number: vehicleNumber.trim(), ...(vehicleModel.trim() ? { vehicle_model: vehicleModel.trim() } : {}), ...(allDocuments.length ? { documents: allDocuments } : {}) }) });
      setSuccess("Rider registration submitted. Await admin approval before going online or taking jobs."); setDocuments([]); uploadCache.current.clear(); rider.refresh();
      window.dispatchEvent(new Event("alpharider:registration"));
    });
  };
  return <RiderShell>
    <h1>Your rider profile</h1>
    <section className={styles.card}>
      <Message error={profileError} />
      {profile.loading ? <p>Loading profile…</p> : <><h2>{profileName(person) || "Account details"}</h2>{person.profile_picture ? <img className={styles.avatar} src={text(person.profile_picture)} alt="Your profile" /> : null}<p>{text(person.email, "Email unavailable")}</p><p>{text(person.phone, "Phone unavailable")}</p><p>{[person.address, person.city, person.state, person.country].map(value => text(value)).filter(Boolean).join(", ") || "No address saved."}</p><Link className={styles.link} href="/user/edit-profile?returnTo=rider">Edit profile</Link></>}
      <button onClick={() => { profile.refresh(); rider.refresh(); }}>Refresh profile</button>
    </section>
    <RiderAvailability />
    <section className={styles.card} id="rider-registration">
      <h2>Vehicle & verification</h2><Message error={missing ? "" : rider.error} />
      {rider.loading ? <p>Loading rider registration…</p> : <>{registered ? <p>Vehicle: {[details.vehicle_type, details.vehicle_model, details.vehicle_number].map(value => text(value)).filter(Boolean).join(" · ") || "No vehicle returned."}</p> : null}{approval ? <p role="status">{riderApprovalMessage(approval)}</p> : null}</>}
      {existingDocuments.length ? <p>{existingDocuments.length} document(s) already submitted.</p> : null}
      {registered ? <p>Your rider registration has already been submitted.</p> : missing ? <form className={styles.form} onSubmit={event => { event.preventDefault(); submit(); }}>
        <label>Vehicle type<select required disabled={save.busy} value={vehicleType} onChange={event => setVehicleType(event.target.value)}><option value="">Choose vehicle type</option>{["Bike", "Car", "Van"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Plate number<input required disabled={save.busy} value={vehicleNumber} onChange={event => setVehicleNumber(event.target.value)} /></label>
        <label>Vehicle model (optional)<input disabled={save.busy} value={vehicleModel} onChange={event => setVehicleModel(event.target.value)} /></label>
        <label>Upload documents (optional)<input type="file" multiple accept="image/*,application/pdf,.pdf" disabled={save.busy || save.uncertain} onChange={event => {
          const files = Array.from(event.target.files ?? []), error = files.map(documentError).find(Boolean);
          event.target.value = "";
          if (error) { setValidationError(error); return; }
          setValidationError("");
          setDocuments(previous => [...previous, ...files.filter(file => !previous.some(old => old.name === file.name && old.size === file.size && old.lastModified === file.lastModified))]);
        }} /></label>
        <small>PDF or image files, up to 3 MB each.</small>
        {documents.map((file, index) => <div className={styles.actions} key={`${file.name}:${index}`}><span>{file.name}</span><button type="button" disabled={save.busy || save.uncertain} aria-label={`Remove ${file.name}`} onClick={() => { uploadCache.current.delete(file); setDocuments(previous => previous.filter(item => item !== file)); }}>Remove</button></div>)}
        <button className={styles.primary} disabled={save.busy || save.uncertain}>{save.busy ? "Uploading & submitting…" : "Submit rider registration"}</button>
        <Message error={validationError || save.error} uncertain={save.uncertain} />
      </form> : null}
    </section>
    {success ? <p role="status">{success}</p> : null}
  </RiderShell>;
}
