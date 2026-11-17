"use client";
import { useEffect, useRef, useState } from "react";
import RiderShell, { Message, Pager, riderStyles as styles } from "./RiderShell";
import MobilityShell from "./MobilityShell";
import { useBackend, useWrite, useStoredQuery } from "@/lib/hooks/use-backend";
import { accountRequest } from "@/lib/account-client";
import { date, profileName, record, rows, text, unwrap } from "@/lib/backend-data";
import { uploadFile } from "@/lib/upload-api";
import { checkSession, currentToken } from "@/lib/account-client";
import { markConversationRead, openDeliveryConversation, sendConversationMessage } from "@/lib/delivery-chat";
import ChatRequestError from "./ChatRequestError";

export default function MessagesWorkspace({ delivery = false, customer = false }: { delivery?: boolean; customer?: boolean }) {
  const contextId = useStoredQuery("id", delivery && !customer ? "alpharider_active_delivery_id" : undefined), initialConversation = useStoredQuery("conversation");
  const [selectedConversation, setConversationId] = useState(""), [offset, setOffset] = useState(0), [category, setCategory] = useState(""), [body, setBody] = useState(""), [before, setBefore] = useState(""), [attachment, setAttachment] = useState<File | null>(null), [uploadedUrl, setUploadedUrl] = useState("");
  const conversationId = selectedConversation || initialConversation;
  const [validation, setValidation] = useState(""), [writeLabel, setWriteLabel] = useState("");
  const [writeAction, setWriteAction] = useState<"delivery" | "support" | "send" | "read" | "">("");
  const threadRef = useRef<HTMLElement>(null), composerRef = useRef<HTMLTextAreaElement>(null);
  const conversations = useBackend(`/chat/conversations?limit=20&offset=${offset}`, 15000), categories = useBackend("/chat-categories"), detail = useBackend(conversationId ? `/chat/conversations/${encodeURIComponent(conversationId)}` : null, 15000), messages = useBackend(conversationId ? `/chat/conversations/${encodeURIComponent(conversationId)}/messages?limit=30${before ? `&before=${encodeURIComponent(before)}` : ""}` : null, before ? 0 : 10000), write = useWrite();
  let list: ReturnType<typeof rows> = [], categoryList: ReturnType<typeof rows> = [], messageList: ReturnType<typeof rows> = [], parseError = "";
  try { if (conversations.data) list = rows(conversations.data); if (categories.data) categoryList = rows(categories.data); if (messages.data) messageList = rows(messages.data).sort((a, b) => Date.parse(text(a.created_at)) - Date.parse(text(b.created_at))); } catch (cause) { parseError = cause instanceof Error ? cause.message : "Could not read messages."; }
  const conversationData = unwrap(detail.data), conversation = record(conversationData.conversation ?? conversationData), closed = conversation.status === "closed";
  const ready = Boolean(detail.data) && !detail.loading && !detail.error && !closed;
  useEffect(() => {
    if (conversationId) threadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [conversationId]);
  useEffect(() => {
    if (conversationId && ready) composerRef.current?.focus({ preventScroll: true });
  }, [conversationId, ready]);
  const participants = Array.isArray(conversation.participants) ? conversation.participants.map(value => { const participant = record(value); return profileName(record(participant.user)) || profileName(participant); }).filter(Boolean) : [];
  const select = (id: string) => { setConversationId(id); setBefore(""); setBody(""); setAttachment(null); setUploadedUrl(""); };
  const open = (type: "delivery" | "support") => {
    if (write.busy || write.uncertain) return;
    if (type === "delivery" && !contextId) { setValidation("Select a delivery first."); return; }
    if (type === "support" && !category) { setValidation("Select a support category."); return; }
    setValidation("");
    setWriteLabel(type === "delivery" ? "Couldn’t open the delivery conversation" : "Couldn’t open the support conversation");
    setWriteAction(type);
    void write.run(async () => {
      let id: string;
      if (type === "delivery") id = await openDeliveryConversation(contextId);
      else { const result = unwrap(await accountRequest("/chat/conversations", { method: "POST", body: JSON.stringify({ type, category_id: category }) })); id = text(result.id ?? record(result.conversation).id); }
      if (!id) throw new Error("The conversation could not be confirmed. Check your conversation list before trying again.");
      select(id); conversations.refresh();
      threadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const send = () => {
    if ((!body.trim() && !attachment && !uploadedUrl) || !conversationId || closed || detail.loading || detail.error || !detail.data) return;
    const token = currentToken(), target = conversationId, message = body.trim();
    setWriteLabel("Couldn’t send your message");
    setWriteAction("send");
    void write.run(async () => { let url = uploadedUrl; if (attachment && !url) { url = (await uploadFile(token, attachment, "chat")).url ?? ""; checkSession(token); setUploadedUrl(url); } await sendConversationMessage(target, message, url); setBody(""); setAttachment(null); setUploadedUrl(""); setBefore(""); messages.refresh(); conversations.refresh(); });
  };
  const Shell = customer ? MobilityShell : RiderShell; return <Shell><h1>Messages & support</h1><Message error={parseError || validation || (write.error && writeAction !== "delivery" ? `${writeLabel}: ${write.error}` : "")} uncertain={write.uncertain} />{contextId ? <section className={styles.card}><h2>Delivery conversation</h2><p>Delivery {contextId}</p><p className={styles.muted}>Chat with {customer ? "your rider" : "the buyer"}. Conversations become read-only when the delivery ends.</p><ChatRequestError title="Couldn’t open buyer chat." error={writeAction === "delivery" ? write.error : ""} method="POST" path="/chat/conversations" status={write.errorStatus} />{writeAction === "delivery" && write.uncertain ? <p role="status">The opening request could not be confirmed. Reload and check your conversations before trying again. <button type="button" onClick={() => window.location.reload()}>Reload</button></p> : null}<button type="button" disabled={write.busy || write.uncertain} aria-busy={write.busy && writeAction === "delivery"} onClick={() => open("delivery")}>{write.busy && writeAction === "delivery" ? "Opening…" : "Open delivery chat"}</button>{write.busy && writeAction === "delivery" ? <p role="status">Opening the conversation. This can take up to 25 seconds.</p> : null}</section> : null}<section className={styles.card}><h2>Contact support</h2><ChatRequestError title="Couldn’t load support topics." error={categories.error} path="/chat-categories" status={categories.errorStatus} retry={categories.refresh} /><label>Topic <select value={category} onChange={event => setCategory(event.target.value)}><option value="">Choose a topic</option>{categoryList.map(item => <option key={text(item.id)} value={text(item.id)}>{text(item.name)}</option>)}</select></label><button disabled={write.busy || write.uncertain || !category} onClick={() => open("support")}>Open support conversation</button></section>
    <div className={styles.grid}><section className={styles.card}><h2>Your conversations</h2><ChatRequestError title="Couldn’t load your conversations." error={conversations.error} path="/chat/conversations" status={conversations.errorStatus} retry={conversations.refresh} />{conversations.loading ? <p>Loading…</p> : list.map(item => <div key={text(item.id)} className={styles.message}><p>{text(item.title ?? item.type, "Conversation")} · {text(item.status)}</p><button disabled={write.busy} onClick={() => select(text(item.id))}>Open conversation</button></div>)}{!conversations.loading && !list.length && !conversations.error ? <p>No conversations yet.</p> : null}<Pager offset={offset} count={list.length} onPage={setOffset} /></section>
    <section ref={threadRef} className={styles.card}><h2>Conversation</h2>{!conversationId ? <p>Select or open a conversation.</p> : <><ChatRequestError title="Couldn’t open this conversation." error={detail.error} path={`/chat/conversations/${encodeURIComponent(conversationId)}`} status={detail.errorStatus} retry={detail.refresh} /><ChatRequestError title="Couldn’t load message history." error={messages.error} path={`/chat/conversations/${encodeURIComponent(conversationId)}/messages`} status={messages.errorStatus} retry={messages.refresh} />{detail.loading ? <p>Loading conversation…</p> : <p>{text(conversation.title ?? conversation.type)} · {text(conversation.status)}</p>}{participants.length ? <p><strong>Participants:</strong> {participants.join(", ")}</p> : null}<button disabled={write.busy || write.uncertain || detail.loading || Boolean(detail.error) || !detail.data} onClick={() => { setWriteLabel("Couldn’t mark messages as read"); setWriteAction("read"); void write.run(async () => { await markConversationRead(conversationId); conversations.refresh(); }); }}>Mark messages read</button><div className={styles.messages}>{messages.loading ? <p>Loading messages…</p> : messageList.map(item => <article key={text(item.id)} className={styles.message}><small>{profileName(record(item.sender)) || "Participant"} · {date(item.created_at)}</small><p>{text(item.body)}</p>{/^https?:\/\//.test(text(item.attachment_url)) ? <a href={text(item.attachment_url)} target="_blank" rel="noreferrer">View attachment</a> : null}</article>)}</div><div className={styles.actions}>{messageList.length >= 30 ? <button onClick={() => setBefore(text(messageList[0].created_at))}>Older messages</button> : null}{before ? <button onClick={() => setBefore("")}>Latest messages</button> : null}</div>{closed ? <p>This conversation is closed.</p> : <form className={styles.form} onSubmit={event => { event.preventDefault(); send(); }}><label>Message<textarea ref={composerRef} maxLength={10000} value={body} onChange={event => setBody(event.target.value)} disabled={write.busy || write.uncertain || !ready} /></label><label>Attachment (up to 3 MB)<input type="file" disabled={write.busy || write.uncertain} onChange={event => { const file = event.target.files?.[0] ?? null; if (file && file.size > 3 * 1024 * 1024) { setValidation("Choose a file up to 3 MB."); return; } setAttachment(file); setUploadedUrl(""); }} /></label><button disabled={write.busy || write.uncertain || detail.loading || Boolean(detail.error) || !detail.data || (!body.trim() && !attachment && !uploadedUrl)}>{write.busy ? "Sending…" : "Send message"}</button></form>}</> }</section></div>
  </Shell>;
}
