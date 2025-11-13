import React, { useState, useEffect } from "react";
import { Send, Search, Menu, MoreVertical } from "lucide-react";
import "./index.css";

export default function WhatsAppCRM() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  // Load messages from storage on mount
  useEffect(() => {
    loadMessages();

    // Refresh every 3 seconds
    const interval = setInterval(() => {
      loadMessages();
      fetchFromVercel();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchFromVercel = async () => {
    try {
      const response = await fetch(
        "https://whatsapp-webhook-vercel-two.vercel.app/api/webhook?logs=true"
      );
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        // Ambil existing messages dari localStorage
        const existing = JSON.parse(
          localStorage.getItem("whatsapp-messages") || "[]"
        );

        // Merge dan hilangkan duplikat berdasarkan ID
        const merged = [...existing];

        data.messages.forEach((newMsg) => {
          if (!merged.find((m) => m.id === newMsg.id)) {
            merged.push(newMsg);
          }
        });

        // Simpan kembali
        localStorage.setItem("whatsapp-messages", JSON.stringify(merged));

        // Reload messages di UI
        loadMessages();
      }
    } catch (error) {
      console.log("Error fetching from Vercel:", error);
    }
  };

  const loadMessages = () => {
    try {
      // Ambil dari localStorage
      const saved = localStorage.getItem("whatsapp-messages");
      const msgs = saved ? JSON.parse(saved) : [];
      setMessages(msgs);

      // Extract unique contacts
      const contactMap = {};
      msgs.forEach((msg) => {
        if (!contactMap[msg.from]) {
          contactMap[msg.from] = {
            phone: msg.from,
            name: `Contact ${msg.from.slice(-4)}`,
            lastMessage: msg.text,
            lastTime: msg.timestamp,
            unread: 0,
          };
        }
        contactMap[msg.from].lastMessage = msg.text;
        contactMap[msg.from].lastTime = msg.timestamp;
      });

      const contactList = Object.values(contactMap).reverse();
      setContacts(contactList);
      if (contactList.length > 0 && !selectedContact) {
        setSelectedContact(contactList[0].phone);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error loading messages:", error);
      setLoading(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedContact) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      from: selectedContact,
      text: replyText,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
    };

    const updatedMessages = [...messages, newMessage];

    // Simpan ke localStorage
    localStorage.setItem("whatsapp-messages", JSON.stringify(updatedMessages));

    setMessages(updatedMessages);
    setReplyText("");
    console.log("Pesan tersimpan:", newMessage);
  };

  const clearAllMessages = async () => {
    if (window.confirm("Hapus semua pesan?")) {
      setMessages([]);
      setContacts([]);
      setSelectedContact(null);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const selectedMessages = selectedContact
    ? messages.filter((msg) => msg.from === selectedContact)
    : [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("id-ID");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Contacts */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-300 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp CRM</h1>
            <button
              onClick={clearAllMessages}
              className="text-gray-500 hover:text-red-500"
            >
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kontak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-200 rounded-full text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {loading ? "Loading..." : "Belum ada pesan"}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.phone}
                onClick={() => setSelectedContact(contact.phone)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition ${
                  selectedContact === contact.phone
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTime(contact.lastTime)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">
                  {contacts.find((c) => c.phone === selectedContact)?.name}
                </p>
                <p className="text-sm text-gray-600">{selectedContact}</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Mulai percakapan
                </div>
              ) : (
                selectedMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.direction === "outgoing"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.direction === "outgoing"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-300 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.direction === "outgoing"
                            ? "text-blue-100"
                            : "text-gray-600"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-300 bg-white flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
                placeholder="Balas pesan..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-full transition"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="text-center">
              <Menu size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Pilih kontak untuk memulai</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
