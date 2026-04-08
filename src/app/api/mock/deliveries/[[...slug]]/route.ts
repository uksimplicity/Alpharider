import { NextResponse } from "next/server";

type MockDelivery = {
  id: string;
  delivery_id?: string;
  order_id?: string;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_contact?: string;
  dropoff_contact?: string;
  other_contact?: string;
  receiver_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  notes?: string;
  rider_id?: string;
  customer_id?: string;
  last_location?: {
    latitude: number;
    longitude: number;
  };
};

declare global {
  // eslint-disable-next-line no-var
  var __alphariderMockDeliveries: MockDelivery[] | undefined;
}

const store = () => {
  if (!globalThis.__alphariderMockDeliveries) {
    globalThis.__alphariderMockDeliveries = [];
  }
  return globalThis.__alphariderMockDeliveries;
};

const sortByRecent = (items: MockDelivery[]) =>
  [...items].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
    return bTime - aTime;
  });

const toId = (item: Partial<MockDelivery>) =>
  item.id ?? item.delivery_id ?? item.order_id ?? "";

const createId = () => `LOC-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;

const isPendingLike = (status?: string) => {
  const normalized = (status ?? "pending").toLowerCase();
  return (
    normalized.includes("pending") ||
    normalized.includes("created") ||
    normalized.includes("requested")
  );
};

const getById = (id: string) => {
  const items = store();
  const delivery = items.find((item) => toId(item) === id);
  return delivery ?? null;
};

const parseBody = async (request: Request) => {
  const raw = await request.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export async function GET(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;

  if (slug.length === 1) {
    const delivery = getById(slug[0]);
    if (!delivery) {
      return NextResponse.json({ message: "Delivery not found." }, { status: 404 });
    }
    return NextResponse.json(delivery);
  }

  if (slug.length > 1) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const statusFilter = (url.searchParams.get("status") ?? "").toLowerCase();
  const list = sortByRecent(store()).filter((item) => {
    if (!statusFilter) return true;
    if (statusFilter === "pending") return isPendingLike(item.status);
    return (item.status ?? "").toLowerCase().includes(statusFilter);
  });

  return NextResponse.json(list.slice(0, Math.max(1, limit)));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;
  const body = await parseBody(request);
  const items = store();

  if (slug.length === 0) {
    const now = new Date().toISOString();
    const id = createId();
    const next: MockDelivery = {
      id,
      status: "pending",
      created_at: now,
      updated_at: now,
      ...(body as Partial<MockDelivery>),
    };
    items.unshift(next);
    return NextResponse.json({ id, status: "pending" });
  }

  if (slug.length !== 2) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const [id, action] = slug;
  const index = items.findIndex((item) => toId(item) === id);
  if (index < 0) {
    return NextResponse.json({ message: "Delivery not found." }, { status: 404 });
  }
  const now = new Date().toISOString();

  if (action === "accept") {
    items[index] = { ...items[index], status: "accepted", updated_at: now };
    return NextResponse.json({ id, status: "accepted" });
  }

  if (action === "location") {
    const latitude = Number((body.latitude as number | string) ?? 0);
    const longitude = Number((body.longitude as number | string) ?? 0);
    items[index] = {
      ...items[index],
      last_location: { latitude, longitude },
      updated_at: now,
    };
    return NextResponse.json({
      id,
      last_location: items[index].last_location,
    });
  }

  if (action === "assign") {
    const riderId = String(body.rider_id ?? "");
    items[index] = {
      ...items[index],
      rider_id: riderId,
      status: "assigned",
      updated_at: now,
    };
    return NextResponse.json({ id, rider_id: riderId, status: "assigned" });
  }

  return NextResponse.json({ message: "Not found." }, { status: 404 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;
  if (slug.length !== 2 || slug[1] !== "status") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const [id] = slug;
  const body = await parseBody(request);
  const status = String(body.status ?? "pending");
  const items = store();
  const index = items.findIndex((item) => toId(item) === id);
  if (index < 0) {
    return NextResponse.json({ message: "Delivery not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  items[index] = {
    ...items[index],
    status,
    updated_at: now,
  };
  return NextResponse.json({ id, status, updated_at: now });
}
