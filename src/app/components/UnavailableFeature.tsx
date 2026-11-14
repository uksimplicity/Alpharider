import Link from "next/link";
import MobilityShell from "./MobilityShell";
export default function UnavailableFeature({ title, message }: { title: string; message: string }) { return <MobilityShell><h1>{title}</h1><section className="mobility-panel"><p>{message}</p><Link className="mobility-button" href="/user/customer-dashboard-4">Back to account</Link></section></MobilityShell>; }
