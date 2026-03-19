const normalizeStatus = (status: string) =>
  status.trim().toLowerCase().replace(/\s+/g, "_");

export const formatDeliveryStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status ?? "");
  if (!normalized) return "Pending";

  const map: Record<string, string> = {
    pending: "Pending",
    assigned: "Assigned",
    accepted: "Accepted",
    in_progress: "In Progress",
    transit: "In Transit",
    completed: "Completed",
    delivered: "Delivered",
    cancelled: "Cancelled",
    declined: "Declined",
  };

  if (map[normalized]) return map[normalized];
  return normalized
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

export const getDeliveryStatusTone = (
  status?: string
): "blue" | "amber" | "green" | "red" => {
  const normalized = normalizeStatus(status ?? "");
  if (
    normalized.includes("completed") ||
    normalized.includes("delivered")
  ) {
    return "green";
  }
  if (
    normalized.includes("cancel") ||
    normalized.includes("declin") ||
    normalized.includes("failed")
  ) {
    return "red";
  }
  if (
    normalized.includes("pending") ||
    normalized.includes("assign") ||
    normalized.includes("accept") ||
    normalized.includes("progress") ||
    normalized.includes("transit")
  ) {
    return "amber";
  }
  return "blue";
};

export const isPendingDeliveryStatus = (status?: string) => {
  const normalized = normalizeStatus(status ?? "");
  return (
    normalized.includes("pending") ||
    normalized.includes("transit") ||
    normalized.includes("assigned") ||
    normalized.includes("accepted") ||
    normalized.includes("in_progress")
  );
};

export const isCompletedDeliveryStatus = (status?: string) => {
  const normalized = normalizeStatus(status ?? "");
  return (
    normalized.includes("completed") ||
    normalized.includes("delivered") ||
    normalized.includes("cancel") ||
    normalized.includes("declin")
  );
};

