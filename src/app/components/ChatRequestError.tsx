import styles from "./rider.module.css";

export default function ChatRequestError({ title, error, path, method = "GET", status, retry }: {
  title: string; error: string; path: string; method?: "GET" | "POST"; status?: number; retry?: () => void;
}) {
  if (!error) return null;
  return <div role="alert" className={styles.error}>
    <p><strong>{title}</strong> {error}</p>
    <details><summary>Error details</summary><p>Request: {method} {path}</p>{status !== undefined ? <p>HTTP status: {status}</p> : null}<p>Server message: {error}</p></details>
    {retry ? <button type="button" onClick={retry}>Try again</button> : null}
  </div>;
}
