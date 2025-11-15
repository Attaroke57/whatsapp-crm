export function handleSendReply(
  replyText,
  selectedContact,
  messages,
  setMessages,
  setReplyText
) {
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
}

export function clearAllMessages(
  setMessages,
  setContacts,
  setSelectedContact,
  selectedContactRef
) {
  if (window.confirm("Hapus semua pesan?")) {
    setMessages([]);
    setContacts([]);
    setSelectedContact(null);
    selectedContactRef.current = null;
    localStorage.removeItem("whatsapp-messages");
  }
}

export function deleteChat(
  phone,
  contacts,
  selectedContact,
  messages,
  setMessages,
  setContacts,
  setSelectedContact,
  selectedContactRef
) {
  if (
    window.confirm(
      `Hapus chat dengan ${contacts.find((c) => c.phone === phone)?.name}?`
    )
  ) {
    const updatedMessages = messages.filter((m) => m.from !== phone);
    setMessages(updatedMessages);
    localStorage.setItem("whatsapp-messages", JSON.stringify(updatedMessages));

    const updatedContacts = contacts.filter((c) => c.phone !== phone);
    setContacts(updatedContacts);

    if (selectedContact === phone) {
      const newSelected =
        updatedContacts.length > 0 ? updatedContacts[0].phone : null;
      setSelectedContact(newSelected);
      selectedContactRef.current = newSelected;
    }
  }
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
