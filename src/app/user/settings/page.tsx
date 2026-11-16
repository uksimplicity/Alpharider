import Link from "next/link";
import MobilityShell from "@/app/components/MobilityShell";
export default function SettingsPage() {
  return <MobilityShell><h1>Settings</h1><section className="mobility-account-links">{[["/user/edit-profile", "Edit profile"], ["/user/change-password", "Change password"], ["/user/notification", "Notifications"], ["/user/in-app-chat", "Messages & support"]].map(([href, label]) => <Link className="mobility-panel mobility-link-panel" href={href} key={href}>{label}</Link>)}</section><section className="mobility-panel"><h2>Location permissions</h2><p>Your browser asks for permission when you choose to share your location. Manage that permission in your browser’s site settings.</p><h2>Account deletion</h2><p>Contact support to request account deletion.</p></section></MobilityShell>;
}
