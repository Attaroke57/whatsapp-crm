import { useState, useEffect, useRef } from "react";

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const selectedContactRef = useRef(null);
  const [sidebarScroll, setSidebarScroll] = useState(0);

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
      }

      setLoading(false);
    } catch (e) {
      console.log("Error load:", e);
      setLoading(false);
    }
  };

  const fetchFromVercel = async () => {
    try {
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

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      if (document.hidden) return;
      loadMessages();
      fetchFromVercel();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    setMessages,
    contacts,
    setContacts,
    loading,
    sidebarRef,
    selectedContactRef,
    sidebarScroll,
    setSidebarScroll,
    loadMessages,
  };
}
