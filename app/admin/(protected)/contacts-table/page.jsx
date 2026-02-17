"use client";

import { Contact } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminContactPage() {
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, showConfirm } = useToast();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        // "http://localhost/himalayanthakali_backend/contacts/get-contacts.php"
          "https://api.himalayanthakali.com/himalayanthakali_backend/contacts/get-contacts.php"

      );
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
      showToast("Failed to load contact messages.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (id) => {
    const confirmed = await showConfirm("Delete this message?", {
      type: "error",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(
        // "http://localhost/himalayanthakali_backend/contacts/delete-contact.php",
        "https://api.himalayanthakali.com/himalayanthakali_backend/contacts/delete-contact.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to delete message.", "error");
        return;
      }

      await fetchMessages();
      showToast(data?.message || "Message deleted.", "success");
    } catch (error) {
      console.error("Failed to delete message:", error);
      showToast("Failed to delete message.", "error");
    }
  };

  // const saveEdit = async () => {
  //   try {
  //     const res = await fetch(
  //       // "http://localhost/himalayanthakali_backend/contacts/update-contact.php",
  //       "https://api.himalayanthakali.com/himalayanthakali_backend/contacts/update-contact.php",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(editing),
  //       }
  //     );
  //     const data = await res.json().catch(() => null);

  //     if (!res.ok || data?.success === false) {
  //       showToast(data?.message || "Failed to update message.", "error");
  //       return;
  //     }

  //     setEditing(null);
  //     await fetchMessages();
  //     showToast(data?.message || "Message updated.", "success");
  //   } catch (error) {
  //     console.error("Failed to update message:", error);
  //     showToast("Failed to update message.", "error");
  //   }
  // };

  return (
    <div className="min-h-screen ">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 mb-6">
       <Contact className="text-[#E9842C] size-6"/>Contact Messages
      </h1>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`contact-row-skeleton-${index}`} className="border-b">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-xs" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center">
                      <Skeleton className="h-7 w-16" />
                    </div>
                  </td>
                </tr>
              ))
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No contact messages found.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    {msg.full_name}
                  </td>
                  <td className="px-4 py-3">
                    {msg.email}
                  </td>
                  <td className="px-4 py-3">
                    {msg.phone}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {msg.message}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    {/* <button
                      onClick={() => setEditing(msg)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white  hover:bg-blue-600"
                    >
                      Edit
                    </button> */}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              Edit Message
            </h2>

            <div className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                value={editing.full_name}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    full_name: e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded px-3 py-2"
                value={editing.email}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    email: e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded px-3 py-2"
                value={editing.phone}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    phone: e.target.value,
                  })
                }
              />

              <textarea
                rows={4}
                className="w-full border rounded px-3 py-2"
                value={editing.message}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    message: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
