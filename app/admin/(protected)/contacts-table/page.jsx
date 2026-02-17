"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Contact,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

const CONTACTS_API =
  "https://api.himalayanthakali.com/himalayanthakali_backend/contacts/get-contacts.php";
const DELETE_CONTACT_API =
  "https://api.himalayanthakali.com/himalayanthakali_backend/contacts/delete-contact.php";

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name = "") {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, showConfirm } = useToast();

  const fetchMessages = useCallback(
    async (manual = false) => {
      if (manual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await fetch(CONTACTS_API);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
        showToast("Failed to load contact messages.", "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((msg) => {
      const haystack = [
        msg.full_name,
        msg.email,
        msg.phone,
        msg.message,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [messages, searchTerm]);

  const todaysMessagesCount = useMemo(() => {
    const today = new Date().toDateString();
    return messages.filter((msg) => {
      const date = new Date(msg.created_at);
      return !Number.isNaN(date.getTime()) && date.toDateString() === today;
    }).length;
  }, [messages]);

  const uniqueSenders = useMemo(() => {
    const normalizedEmails = messages
      .map((msg) => (msg.email || "").trim().toLowerCase())
      .filter(Boolean);
    return new Set(normalizedEmails).size;
  }, [messages]);

  const deleteMessage = async (id) => {
    const confirmed = await showConfirm("Delete this message?", {
      type: "error",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(DELETE_CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to delete message.", "error");
        return;
      }

      await fetchMessages(true);
      showToast(data?.message || "Message deleted.", "success");
    } catch (error) {
      console.error("Failed to delete message:", error);
      showToast("Failed to delete message.", "error");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Contact className="h-6 w-6 text-[#E9842C]" />
              Contact Messages
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor incoming inquiries and remove processed messages.
            </p>
          </div>

          <button
            onClick={() => fetchMessages(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Messages</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{messages.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Received Today</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{todaysMessagesCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Unique Senders</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{uniqueSenders}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, phone or message"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#E9842C] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-215 text-left">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Sender</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`contact-row-skeleton-${index}`} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="mb-2 h-4 w-44" />
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-slate-500">
                    {messages.length === 0
                      ? "No contact messages found."
                      : "No messages match your search."}
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="border-t border-slate-200 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#E9842C]">
                          {getInitials(msg.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{msg.full_name}</p>
                          <p className="text-xs text-slate-500">#{msg.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {msg.email || "-"}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {msg.phone || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="max-w-sm truncate text-sm text-slate-700">
                        {msg.message || "No message body"}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDateTime(msg.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
