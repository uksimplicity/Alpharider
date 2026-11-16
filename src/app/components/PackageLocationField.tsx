"use client";
import { useEffect, useRef, useState } from "react";
import { checkSession, currentToken } from "@/lib/account-client";
import { loadGoogleMaps, mapPoint, mapsAuthFailureEvent, type DeliveryPoint, type GoogleMapApi } from "@/lib/google-maps";
import { locatePackageAddress, validPackagePoint, type PackageLocation } from "@/lib/package-location";
import { nigeriaLGAs, nigeriaStates } from "@/data/nigeriaLocations";
import { completeAddressDetails, fullAddress, readAddressDetails, type AddressDetails } from "@/lib/structured-address";

function LocationMap({ point, onSelect }: { point: DeliveryPoint | null; onSelect: (point: DeliveryPoint) => void }) {
  const element = useRef<HTMLDivElement>(null), select = useRef(onSelect);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const map = useRef<InstanceType<GoogleMapApi["Map"]> | null>(null);
  const marker = useRef<InstanceType<GoogleMapApi["Marker"]> | null>(null);
  useEffect(() => { select.current = onSelect; }, [onSelect]);
  useEffect(() => {
    let active = true;
    const listeners: { remove(): void }[] = [];
    const denied = () => { if (active) setError("The map is unavailable. Retry later, or use your current location if you are at this address."); };
    window.addEventListener(mapsAuthFailureEvent, denied);
    void loadGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").then(api => {
      if (!active || !element.current) return;
      // Initial viewport only. It is never submitted as a selected location.
      const center = { lat: 6.5244, lng: 3.3792 };
      const view = new api.Map(element.current, { center, zoom: 11, streetViewControl: false, mapTypeControl: false });
      const pin = new api.Marker({ map: view, draggable: true, position: center, visible: false });
      map.current = view; marker.current = pin; setReady(true);
      const choose = (event: { latLng?: { lat(): number; lng(): number } }) => {
        if (!active || !event.latLng) return;
        const next = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
        if (validPackagePoint(next)) select.current(next);
      };
      listeners.push(view.addListener("click", choose), pin.addListener("dragend", choose));
    }).catch(denied);
    return () => { active = false; window.removeEventListener(mapsAuthFailureEvent, denied); listeners.forEach(listener => listener.remove()); marker.current?.setMap(null); map.current = null; marker.current = null; };
  }, []);
  useEffect(() => { if (ready && map.current && marker.current) { marker.current.setVisible(Boolean(point)); if (point) { map.current.setCenter(mapPoint(point)); marker.current.setPosition(mapPoint(point)); } } }, [point, ready]);
  return <div>{error ? <p role="status">{error}</p> : <><div className="package-location-map" ref={element} aria-label="Address location map" />{!ready ? <p role="status">Loading map…</p> : <p className="mobility-muted">Click the map or drag the pin, then confirm the location.</p>}</>}</div>;
}

export default function PackageLocationField({ label, address, point, onAddressChange, onConfirm, disabled }: {
  label: string; address: string; point: PackageLocation | null;
  onAddressChange: (address: string) => void; onConfirm: (point: PackageLocation) => void; disabled: boolean;
}) {
  const [candidate, setCandidate] = useState<{ point: DeliveryPoint; address: string; token: string } | null>(null);
  const [details, setDetails] = useState(() => readAddressDetails(address));
  const complete = completeAddressDetails(details);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false), [attempt, setAttempt] = useState(0);
  const version = useRef(0);
  const manualRequest = useRef(false);
  const lifetime = useRef({ active: true });
  const confirmed = point?.address === address.trim() && validPackagePoint(point);
  const selected = candidate?.address === address.trim() ? candidate : null;
  useEffect(() => {
    if (!complete || !address.trim() || disabled || confirmed || selected || manualRequest.current) return;
    let active = true;
    const generation = ++version.current;
    const timer = setTimeout(() => {
      setBusy(true); setError("");
      void (async () => {
        try {
          const token = currentToken(), result = await locatePackageAddress(address);
          if (!active || generation !== version.current) return;
          checkSession(token); setCandidate({ point: result, address: address.trim(), token });
        } catch (cause) {
          if (active && generation === version.current) setError(cause instanceof Error ? cause.message : "We couldn’t locate this address. Try again.");
        } finally { if (active && generation === version.current) setBusy(false); }
      })();
    }, 900);
    return () => { active = false; clearTimeout(timer); };
  }, [address, complete, disabled, confirmed, selected, attempt]);
  useEffect(() => { const current = lifetime.current; current.active = true; return () => { current.active = false; }; }, []);
  const choose = (next: DeliveryPoint) => {
    if (disabled || !complete || !lifetime.current.active) return;
    manualRequest.current = false;
    version.current++;
    setBusy(false);
    try { if (!validPackagePoint(next)) throw new Error("Choose a valid location."); onAddressChange(address); setCandidate({ point: next, address: address.trim(), token: currentToken() }); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Please sign in again."); }
  };
  const locate = () => {
    if (!complete) return;
    if (!navigator.geolocation) { setError("Location access is unavailable. Choose the address on the map."); return; }
    let token: string;
    try { token = currentToken(); } catch { setError("Please sign in again before choosing a location."); return; }
    manualRequest.current = true;
    onAddressChange(address); setCandidate(null);
    const generation = ++version.current;
    setBusy(true); setError("");
    navigator.geolocation.getCurrentPosition(position => {
      if (!lifetime.current.active || generation !== version.current) return;
      try { checkSession(token); choose({ latitude: position.coords.latitude, longitude: position.coords.longitude }); }
      catch (cause) { setBusy(false); setError(cause instanceof Error ? cause.message : "Your location could not be confirmed."); }
    }, failure => { if (!lifetime.current.active || generation !== version.current) return; manualRequest.current = false; setBusy(false); setError(failure.code === 1 ? "Allow location access, or choose this address on the map." : "Your location could not be found. Try again or choose the address on the map."); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  };
  const changeDetail = (field: keyof AddressDetails, value: string) => {
    const next = { ...details, [field]: value, ...(field === "state" ? { lga: "" } : {}) };
    version.current++; manualRequest.current = false;
    setDetails(next); setCandidate(null); setBusy(false); setError("");
    onAddressChange(fullAddress(next));
  };
  return <fieldset className="package-location-field" disabled={disabled}><legend>{label}</legend>
    <div className="package-address-fields">
      <label><span>House number</span><input required type="text" maxLength={30} autoComplete="off" placeholder="e.g. 12B" value={details.houseNumber} onChange={event => changeDetail("houseNumber", event.target.value)} /></label>
      <label><span>Street name</span><input required type="text" maxLength={200} autoComplete="address-line1" placeholder="e.g. Admiralty Way" value={details.street} onChange={event => changeDetail("street", event.target.value)} /></label>
      <label><span>State</span><select required autoComplete="address-level1" value={details.state} onChange={event => changeDetail("state", event.target.value)}><option value="">Select state</option>{nigeriaStates.map(state => <option key={state} value={state}>{state}</option>)}</select></label>
      <label><span>Local government</span><select required autoComplete="address-level2" disabled={!details.state} value={details.lga} onChange={event => changeDetail("lga", event.target.value)}><option value="">{details.state ? "Select local government" : "Select state first"}</option>{(nigeriaLGAs[details.state] || []).map(lga => <option key={lga} value={lga}>{lga}</option>)}</select></label>
    </div>
    <label><span>{label} address</span><textarea rows={2} readOnly value={address} placeholder="Your full address appears here" /></label>
    <p className="mobility-muted">{complete ? "We’ll locate this address for you." : "Complete the house number, street name, state and local government."}</p>
    {busy ? <p role="status">Finding {label.toLowerCase()} location…</p> : null}
    {error ? <><p className="mobility-error" role="status">{error}</p><button className="mobility-text-button" type="button" onClick={() => { setCandidate(null); setAttempt(value => value + 1); }}>Retry address lookup</button></> : null}
    {confirmed ? <p role="status">{label} location confirmed.</p> : selected ? <><p>Location selected. Check that it matches the address.</p><button className="mobility-button secondary" type="button" onClick={() => { try { checkSession(selected.token); onConfirm({ ...selected.point, address: address.trim() }); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Please sign in again."); } }}>Confirm {label.toLowerCase()} location</button></> : null}
    <div className="package-location-actions"><button type="button" className="mobility-text-button" disabled={!complete || busy} onClick={() => setMapOpen(value => !value)}>{mapOpen ? "Hide map" : `Choose ${label.toLowerCase()} on map`}</button><button type="button" className="mobility-text-button" disabled={!complete || busy} onClick={locate}>Use my location for {label.toLowerCase()}</button></div>
    <p className="mobility-muted">Use your current location only if you are at this address.</p>
    {mapOpen ? <LocationMap point={selected?.point || point} onSelect={choose} /> : null}
  </fieldset>;
}
