import styles from "./delivery-request.module.css";

export default function RequestDecisionButtons({ disabled = false, busy = false, acceptLabel = "Accept", onAccept }: {
  disabled?: boolean;
  busy?: boolean;
  acceptLabel?: string;
  onAccept: () => void;
}) {
  return <div className={styles.decisions}>
    <button type="button" className={styles.accept} disabled={disabled || busy} onClick={onAccept}>{busy ? "Accepting…" : acceptLabel}</button>
  </div>;
}
