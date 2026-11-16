import Link from "next/link";
import MobilityShell from "@/app/components/MobilityShell";
import CustomerDeliveryList from "@/app/components/CustomerDeliveryList";
export default function UserDeliveryPage() {
  return <MobilityShell><p className="mobility-eyebrow">ALPHA SEND</p><div className="mobility-title-row"><h1>Your packages, in one place.</h1><Link className="mobility-button" href="/user/package-information-3">Send a package</Link></div><CustomerDeliveryList /></MobilityShell>;
}
