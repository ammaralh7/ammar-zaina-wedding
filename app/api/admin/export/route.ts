import { isAdmin } from "@/lib/admin-auth";
import { listRsvps } from "@/lib/rsvp";

function csvCell(value: string | number | boolean | null) {
  const text = value === null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const rows = (await listRsvps()) ?? [];
  const header = ["Name", "Attending", "Party size", "Phone", "Message", "Language", "Replied at"];
  const lines = rows.map((r) =>
    [r.name, r.attending ? "yes" : "no", r.party_size, r.phone, r.message, r.locale, r.created_at]
      .map(csvCell)
      .join(","),
  );

  // BOM so Excel opens Arabic names correctly
  const body = "﻿" + [header.join(","), ...lines].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ammar-zaina-rsvps.csv"',
      "Cache-Control": "no-store",
    },
  });
}
