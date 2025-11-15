import React, { useState, useEffect, useRef } from "react";
import { Send, Menu, MoreVertical } from "lucide-react";
import { formatTime } from "../utils/chatActions";

export function ChatArea({
  selectedContact,
  contacts,
  selectedMessages,
  replyText,
  onReplyChange,
  onSendReply,
  messagesEndRef,
}) {
  // 🔧 DITAMBAHKAN: State untuk kontrol auto-scroll
  const [autoScroll, setAutoScroll] = useState(true);

  // 🔧 DITAMBAHKAN: Handler scroll
  const handleScroll = (e) => {
    const el = e.target;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;

    setAutoScroll(isNearBottom);
  };

  // 🔧 DITAMBAHKAN: Scroll hanya saat user ada di bawah
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMessages]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {selectedContact ? (
        <>
          <div className="p-4 border-b header-wa flex justify-between">
            <div>
              <p className="font-semibold">
                {contacts.find((c) => c.phone === selectedContact)?.name}
              </p>
              <p className="text-sm opacity-80">{selectedContact}</p>
            </div>
            <MoreVertical size={22} className="opacity-80" />
          </div>

          {/* 🔧 DIBENERIN DI SINI → tambah onScroll & hapus absolute wallpaper */}
          <div
            className="flex-1 overflow-y-auto p-6 chat-wallpaper"
            onScroll={handleScroll} // ❗ penting
          >
            <div className="space-y-4">
              {selectedMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.direction === "outgoing"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={
                      msg.direction === "outgoing" ? "bubble-out" : "bubble-in"
                    }
                  >
                    <p>{msg.text}</p>
                    <p className="text-[10px] opacity-70 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* tempat auto-scroll ke bawah */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t bg-white flex gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => onReplyChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSendReply()}
              placeholder="Balas pesan..."
              className="flex-1 px-4 py-2 border rounded-full"
            />
            <button
              onClick={onSendReply}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
            >
              <Send size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Menu size={48} className="mx-auto mb-4 opacity-30" />
            <p>Pilih kontak untuk memulai</p>
          </div>
        </div>
      )}
    </div>
  );
}
