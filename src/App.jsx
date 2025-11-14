import React, { useState, useEffect, useRef } from "react";
import { Send, Search, Menu, MoreVertical } from "lucide-react";
import "./index.css";

export default function WhatsAppCRM() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const selectedContactRef = useRef(null);

  const sidebarRef = useRef(null);
  const [sidebarScroll, setSidebarScroll] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      if (document.hidden) return;
      loadMessages();
      fetchFromVercel();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchFromVercel = async () => {
    try {
      // Update ke endpoint baru /api/messages
      const response = await fetch(
        "https://whatsapp-webhook-vercel-two.vercel.app/api/messages"
      );
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        const existing = JSON.parse(
          localStorage.getItem("whatsapp-messages") || "[]"
        );

        const merged = [...existing];

        data.messages.forEach((newMsg) => {
          if (!merged.find((m) => m.id === newMsg.id)) {
            merged.push(newMsg);
          }
        });

        localStorage.setItem("whatsapp-messages", JSON.stringify(merged));

        loadMessages();
      }
    } catch (error) {
      console.log("Error fetching from Vercel:", error);
    }
  };

  const loadMessages = () => {
    try {
      const saved = localStorage.getItem("whatsapp-messages");
      const msgs = saved ? JSON.parse(saved) : [];

      const existingMsgIds = new Set(messages.map((m) => m.id));
      const newMsgIds = new Set(msgs.map((m) => m.id));

      const hasChanges =
        msgs.length !== messages.length ||
        [...newMsgIds].some((id) => !existingMsgIds.has(id));

      if (!hasChanges && contacts.length > 0) return;

      setMessages(msgs);

      const contactMap = {};
      msgs.forEach((msg) => {
        if (!contactMap[msg.from]) {
          contactMap[msg.from] = {
            phone: msg.from,
            name: `Contact ${msg.from.slice(-4)}`,
            lastMessage: msg.text,
            lastTime: msg.timestamp,
          };
        } else {
          contactMap[msg.from].lastMessage = msg.text;
          contactMap[msg.from].lastTime = msg.timestamp;
        }
      });

      const contactList = Object.values(contactMap).sort(
        (a, b) => new Date(b.lastTime) - new Date(a.lastTime)
      );

      setContacts(contactList);

      setTimeout(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = sidebarScroll;
      }, 0);

      if (!selectedContactRef.current && contactList.length > 0) {
        selectedContactRef.current = contactList[0].phone;
        setSelectedContact(contactList[0].phone);
      }

      if (selectedContactRef.current)
        setSelectedContact(selectedContactRef.current);

      setLoading(false);
    } catch (e) {
      console.log("Error load:", e);
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

    localStorage.setItem("whatsapp-messages", JSON.stringify(updatedMessages));

    setMessages(updatedMessages);
    setReplyText("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const clearAllMessages = () => {
    if (window.confirm("Hapus semua pesan?")) {
      setMessages([]);
      setContacts([]);
      setSelectedContact(null);
      localStorage.removeItem("whatsapp-messages");
    }
  };

  const deleteChat = (phone) => {
    if (
      window.confirm(
        `Hapus chat dengan ${contacts.find((c) => c.phone === phone)?.name}?`
      )
    ) {
      // Hapus pesan dari contact tertentu
      const updatedMessages = messages.filter((m) => m.from !== phone);
      setMessages(updatedMessages);
      localStorage.setItem(
        "whatsapp-messages",
        JSON.stringify(updatedMessages)
      );

      // Update contacts
      const updatedContacts = contacts.filter((c) => c.phone !== phone);
      setContacts(updatedContacts);

      // Reset selected contact
      if (selectedContact === phone) {
        setSelectedContact(
          updatedContacts.length > 0 ? updatedContacts[0].phone : null
        );
        selectedContactRef.current =
          updatedContacts.length > 0 ? updatedContacts[0].phone : null;
      }
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedMessages = selectedContact
    ? messages.filter((msg) => msg.from === selectedContact)
    : [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b header-wa flex justify-between items-center">
          <h1 className="text-xl font-semibold">WhatsApp CRM</h1>
          <button onClick={clearAllMessages} className="text-white/80">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="p-3 bg-gray-100 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kontak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-full text-sm"
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          ref={sidebarRef}
          onScroll={() => {
            setSidebarScroll(sidebarRef.current.scrollTop);
          }}
        >
          {filteredContacts.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              {loading ? "Loading..." : "Belum ada pesan"}
            </p>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.phone}
                onClick={() => {
                  setSelectedContact(contact.phone);
                  selectedContactRef.current = contact.phone;
                }}
                className={`p-4 border-b cursor-pointer transition ${
                  selectedContact === contact.phone
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600 truncate">
                  {contact.lastMessage}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat */}
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

            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="absolute inset-0 chat-wallpaper"></div>

              <div className="relative z-10 space-y-4">
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
                        msg.direction === "outgoing"
                          ? "bubble-out"
                          : "bubble-in"
                      }
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] opacity-70 text-right mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t bg-white flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                placeholder="Balas pesan..."
                className="flex-1 px-4 py-2 border rounded-full"
              />
              <button
                onClick={handleSendReply}
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
    </div>
  );
}
