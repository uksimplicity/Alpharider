"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearAuthSession } from "@/lib/session";
import styles from "./rider.module.css";
import RiderLocationReporter from "./RiderLocationReporter";
export { default as riderStyles } from "./rider.module.css";
export default function RiderShell({ children, activeDeliveryId }: { children: ReactNode; activeDeliveryId?: string }) {
  const path = usePathname(), router = useRouter();
  return <div className={styles.app}><a className={styles.skipLink} href="#rider-content">Skip to content</a><header className={styles.header}><Link href="/dashboard"><Image src="/logo.png" width={140} height={42} alt="AlphaRide" /></Link><button onClick={() => { clearAuthSession(); router.replace("/auth/login"); }}>Sign out</button></header><nav className={styles.nav} aria-label="Rider navigation">{[["/dashboard", "Dashboard"], ["/rider", "Profile & availability"], ["/rider/deliveries", "My deliveries"], ["/rider/earnings", "Earnings"], ["/rider/wallet", "Wallet & payouts"], ["/rider/notifications", "Notifications"], ["/rider/messages", "Messages"], ["/user/change-password", "Password"]].map(([href, label]) => <Link key={href} href={href} aria-current={path === href || (href !== "/rider" && path.startsWith(`${href}/`)) ? "page" : undefined}>{label}</Link>)}</nav><main id="rider-content" tabIndex={-1} className={styles.main}><RiderLocationReporter activeDeliveryId={activeDeliveryId} />{children}</main></div>;
}
export function Message({ error, uncertain = false }: { error: string; uncertain?: boolean }) { return error ? <div role="alert" className={styles.error}><p>{error}</p>{uncertain ? <p>The result could not be confirmed. Refresh and check the record before trying again. <button onClick={() => window.location.reload()}>Reload</button></p> : null}</div> : null; }
export function Pager({ offset, count, onPage }: { offset: number; count: number; onPage: (offset: number) => void }) { return <div className={styles.actions}><button disabled={!offset} onClick={() => onPage(Math.max(0, offset - 20))}>Previous</button><span>Page {offset / 20 + 1}</span><button disabled={count < 20} onClick={() => onPage(offset + 20)}>Next</button></div>; }
