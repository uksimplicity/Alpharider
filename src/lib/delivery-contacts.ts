import { profileName, record, text, type Row } from "./backend-data";
import { riderJob } from "./rider-job";

const first = (...values: unknown[]) => values.map(value => text(value)).find(Boolean) || "";
const name = (row: Row) => profileName(row) || profileName(record(row.user));
const phone = (row: Row) => first(row.phone, row.phone_number, row.phoneNumber, record(row.user).phone, record(row.user).phone_number);
const contactPhone = (value: unknown) => phone(record(value)) || text(value);

export function deliveryContacts(raw: Row) {
  const order = record(raw.order), seller = record(raw.seller), orderSeller = record(order.seller);
  const buyer = record(raw.buyer), orderBuyer = record(order.buyer), customer = record(raw.customer ?? raw.user);
  const receiver = record(raw.receiver ?? raw.recipient), pickup = record(raw.pickup_contact), dropoff = record(raw.dropoff_contact);
  const marketplace = riderJob(raw).source === "marketplace";
  return {
    pickup: {
      label: marketplace ? "Seller · pickup contact" : "Pickup contact",
      name: first(name(seller), raw.seller_name, name(orderSeller), order.seller_name, name(pickup), raw.pickup_contact_name, raw.sender_name, !marketplace ? name(customer) || text(raw.customer_name) : ""),
      phone: first(phone(seller), raw.seller_phone, raw.seller_phone_number, phone(orderSeller), order.seller_phone, contactPhone(raw.pickup_contact), raw.pickup_phone, raw.sender_phone, !marketplace ? phone(customer) : ""),
    },
    dropoff: {
      label: marketplace ? "Buyer · drop-off contact" : "Drop-off contact",
      name: first(name(buyer), raw.buyer_name, name(orderBuyer), order.buyer_name, marketplace ? name(customer) || text(raw.customer_name) : "", name(dropoff), raw.receiver_name, raw.recipient_name, name(receiver)),
      phone: first(phone(buyer), raw.buyer_phone, raw.buyer_phone_number, phone(orderBuyer), order.buyer_phone, contactPhone(raw.dropoff_contact), raw.receiver_phone, raw.recipient_phone, phone(receiver), marketplace ? phone(customer) : ""),
    },
  };
}
