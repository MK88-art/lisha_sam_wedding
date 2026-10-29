"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Rsvp = {
  id: number;
  name: string;
  guestStatus: "married" | "single";
  bringingPlusOne: boolean;
  plusOne: string | null;
  attendance: string;
  phone: string;
  email: string;
  createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_RSVP_API_URL || "/api/rsvps.php";

function csvCell(value: string) {
  const safeValue = /^[\t\r=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export default function RsvpsPage() {
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<Rsvp[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRecords(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        headers: { "X-Admin-Password": password },
        cache: "no-store",
      });
      const responseBody = await response.text();
      let result: { records?: Rsvp[]; error?: string };

      try {
        result = JSON.parse(responseBody);
      } catch {
        throw new Error(
          `The RSVP server returned an unexpected response (HTTP ${response.status}). Check the PHP server logs.`,
        );
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load RSVP records.");
      }

      if (!Array.isArray(result.records)) {
        throw new Error("The server returned an invalid registrations response.");
      }

      setRecords(result.records);
    } catch (requestError) {
      setRecords(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load RSVP records.",
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    if (!records) return;

    const rows = [
      [
        "Name",
        "Guest status",
        "Bringing plus one",
        "Plus-one name",
        "Attendance",
        "Phone",
        "Email",
        "Submitted at",
      ],
      ...records.map((record) => [
        record.name,
        record.guestStatus,
        record.bringingPlusOne ? "Yes" : "No",
        record.plusOne || "",
        record.attendance,
        record.phone,
        record.email,
        record.createdAt,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-rsvps.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12 text-[#24342f] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
              Private admin page
            </p>
            <h1 className="font-serif text-5xl tracking-[-0.03em] sm:text-6xl">
              RSVP registrations
            </h1>
          </div>
          <a className="print-hidden text-sm underline underline-offset-4" href="/">
            Back to wedding site
          </a>
        </header>

        {records === null ? (
          <form
            onSubmit={loadRecords}
            className="print-hidden grid max-w-md gap-5 border-t border-[#c8c5bb] pt-6"
          >
            <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-[#6d7770]">
              Admin password
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-b border-[#a9aaa1] bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-[#24342f] outline-none focus:border-[#a06b58]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-fit rounded-full bg-[#24342f] px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              {loading ? "Loading..." : "View registrations"}
            </button>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
          </form>
        ) : (
          <>
            <div className="print-hidden mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[#6d7770]">
                {records.length} {records.length === 1 ? "registration" : "registrations"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={downloadCsv}
                  disabled={records.length === 0}
                  className="rounded-full bg-[#24342f] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white disabled:opacity-50"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={records.length === 0}
                  className="rounded-full border border-[#24342f] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] disabled:opacity-50"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecords(null);
                    setPassword("");
                  }}
                  className="rounded-full border border-[#c8c5bb] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em]"
                >
                  Lock
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <p className="border-t border-[#c8c5bb] py-8 text-[#6d7770]">
                No registrations have been submitted yet.
              </p>
            ) : (
              <div className="overflow-x-auto border-t border-[#c8c5bb]">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#c8c5bb] text-[10px] uppercase tracking-[0.16em] text-[#6d7770]">
                      <th className="px-3 py-4">Name</th>
                      <th className="px-3 py-4">Status</th>
                      <th className="px-3 py-4">Plus one</th>
                      <th className="px-3 py-4">Attendance</th>
                      <th className="px-3 py-4">Phone</th>
                      <th className="px-3 py-4">Email</th>
                      <th className="px-3 py-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-[#e0ddd5] align-top"
                      >
                        <td className="px-3 py-4 font-medium">{record.name}</td>
                        <td className="px-3 py-4 capitalize">
                          {record.guestStatus}
                        </td>
                        <td className="px-3 py-4">
                          {record.bringingPlusOne
                            ? record.plusOne || "Yes"
                            : "No"}
                        </td>
                        <td className="px-3 py-4">{record.attendance}</td>
                        <td className="px-3 py-4">{record.phone}</td>
                        <td className="px-3 py-4">{record.email}</td>
                        <td className="px-3 py-4">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
