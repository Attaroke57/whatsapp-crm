import React, { useState, useEffect, useRef } from "react";
import { useMessages } from "./hooks/useMessages";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import {
  handleSendReply,
  clearAllMessages,
  deleteChat,
} from "./utils/chatActions";
import "./index.css";

export default function WhatsAppCRM() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  const {
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
  } = useMessages();

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedMessages = selectedContact
    ? messages.filter((msg) => msg.from === selectedContact)
    : [];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        filteredContacts={filteredContacts}
        selectedContact={selectedContact}
        onSelectContact={(phone) => {
          setSelectedContact(phone);
          selectedContactRef.current = phone;
        }}
        onDeleteChat={(phone) =>
          deleteChat(
            phone,
            contacts,
            selectedContact,
            messages,
            setMessages,
            setContacts,
            setSelectedContact,
            selectedContactRef
          )
        }
        onClearAll={() =>
          clearAllMessages(
            setMessages,
            setContacts,
            setSelectedContact,
            selectedContactRef
          )
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
      />

      <ChatArea
        selectedContact={selectedContact}
        contacts={contacts}
        selectedMessages={selectedMessages}
        replyText={replyText}
        onReplyChange={setReplyText}
        onSendReply={() =>
          handleSendReply(
            replyText,
            selectedContact,
            messages,
            setMessages,
            setReplyText,
            messagesEndRef
          )
        }
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
