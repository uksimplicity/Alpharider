import { record, text, type Row } from "./backend-data";
import { riderJob } from "./rider-job";

const first = (...values: unknown[]) => values.map(value => text(value)).find(Boolean) || "";

export function deliveryContactsVisible(raw: Row, accepted = false) {
  const job = riderJob(raw);
  if (!["assigned", "picking_up", "on_the_way", "delivered", "completed"].includes(job.status)) return false;
  return accepted || job.acceptanceReported || !job.needsAcceptance;
}
// Only follow profile wrappers within a known party, so a missing contact name
// cannot accidentally become the rider's name or the other party's name.
function profiles(value: unknown): Row[] {
  const result: Row[] = [], seen = new Set<object>();
  const queue = [{ value, depth: 0 }];
  while (queue.length && result.length < 32) {
    const current = queue.shift()!;
    if (!current.value || typeof current.value !== "object" || Array.isArray(current.value) || seen.has(current.value)) continue;
    seen.add(current.value);
    const row = record(current.value); result.push(row);
    if (current.depth < 5) for (const key of ["user", "User", "profile", "Profile", "data", "result", "payload"]) {
      if (row[key]) queue.push({ value: row[key], depth: current.depth + 1 });
    }
  }
  return result;
}
function name(value: unknown) {
  return first(...profiles(value).map(row => first(
    row.name, row.Name, row.full_name, row.fullName, row.FullName,
    [first(row.first_name, row.firstName, row.FirstName), first(row.last_name, row.lastName, row.LastName)].filter(Boolean).join(" "),
  )));
}
function phone(value: unknown) {
  return first(...profiles(value).map(row => first(row.phone, row.phone_number, row.phoneNumber, row.Phone, row.PhoneNumber)));
}
const contactPhone = (value: unknown) => phone(value) || text(value);
const party = (rows: Row[], keys: string[]) => rows.flatMap(row => keys.map(key => row[key]));

export function deliveryContacts(raw: Row) {
  const orderRows = [record(raw.order), record(raw.Order)];
  const sellers = party([raw, ...orderRows], ["seller", "Seller", "seller_profile", "sellerProfile", "SellerProfile"]);
  const buyers = party([raw, ...orderRows], ["buyer", "Buyer", "buyer_profile", "buyerProfile", "BuyerProfile"]);
  const customers = party([raw, ...orderRows], ["customer", "Customer", "user", "User"]);
  const receivers = party([raw], ["receiver", "Receiver", "recipient", "Recipient"]);
  const pickup = raw.pickup_contact ?? raw.pickupContact ?? raw.PickupContact;
  const dropoff = raw.dropoff_contact ?? raw.dropoffContact ?? raw.DropoffContact;
  const marketplace = riderJob(raw).source === "marketplace";
  const sellerNames = [raw, ...orderRows].flatMap(row => [row.seller_name, row.sellerName, row.SellerName]);
  const buyerNames = [raw, ...orderRows].flatMap(row => [row.buyer_name, row.buyerName, row.BuyerName]);
  const customerName = first(...customers.map(name), raw.customer_name, raw.customerName, raw.CustomerName);
  return {
    pickup: {
      label: marketplace ? "Seller · pickup contact" : "Pickup contact",
      name: first(...sellers.map(name), ...sellerNames, name(pickup), raw.pickup_contact_name, raw.pickupContactName, raw.PickupContactName, raw.sender_name, raw.senderName, !marketplace ? customerName : ""),
      phone: first(...sellers.map(phone), raw.seller_phone, raw.sellerPhone, raw.SellerPhone, raw.seller_phone_number, ...orderRows.map(row => row.seller_phone ?? row.sellerPhone ?? row.SellerPhone), contactPhone(pickup), raw.pickup_phone, raw.sender_phone, !marketplace ? first(...customers.map(phone)) : ""),
    },
    dropoff: {
      label: marketplace ? "Buyer · drop-off contact" : "Drop-off contact",
      name: first(...buyers.map(name), ...buyerNames, marketplace ? customerName : "", name(dropoff), raw.receiver_name, raw.receiverName, raw.ReceiverName, raw.recipient_name, raw.recipientName, ...receivers.map(name)),
      phone: first(...buyers.map(phone), raw.buyer_phone, raw.buyerPhone, raw.BuyerPhone, raw.buyer_phone_number, ...orderRows.map(row => row.buyer_phone ?? row.buyerPhone ?? row.BuyerPhone), contactPhone(dropoff), raw.receiver_phone, raw.recipient_phone, ...receivers.map(phone), marketplace ? first(...customers.map(phone)) : ""),
    },
  };
}
