import { accountRequest } from "./account-client";
import { record, text, unwrap } from "./backend-data";

// The published rider contract selects the delivery customer on the server.
// It does not accept a seller/recipient ID. Do not invent recipient parameters.
export async function openDeliveryConversation(deliveryId: string) {
  if (!deliveryId.trim()) throw new Error("Select a delivery first.");
  const result = unwrap(await accountRequest("/chat/conversations", {
    method: "POST", body: JSON.stringify({ type: "delivery", context_id: deliveryId }),
  }));
  const conversation = record(result.conversation ?? result), id = text(conversation.id);
  if (!id || (text(conversation.context_id) && text(conversation.context_id) !== deliveryId) || (text(conversation.type) && conversation.type !== "delivery")) {
    throw new Error("The delivery conversation could not be confirmed. Check your conversation list before trying again.");
  }
  return id;
}

export async function sendConversationMessage(conversationId: string, body: string, attachmentUrl = "") {
  if (!conversationId.trim()) throw new Error("Select a conversation first.");
  const message = body.trim();
  if (!message && !attachmentUrl) throw new Error("Enter a message or attach a file.");
  if (message.length > 10000) throw new Error("Messages can contain up to 10,000 characters.");
  return accountRequest(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST", body: JSON.stringify({ ...(message ? { body: message } : {}), ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}) }),
  });
}

export function markConversationRead(conversationId: string) {
  if (!conversationId.trim()) throw new Error("Select a conversation first.");
  return accountRequest(`/chat/conversations/${encodeURIComponent(conversationId)}/read`, { method: "POST" });
}
