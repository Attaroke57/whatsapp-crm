import React from "react";
import { Search, MoreVertical } from "lucide-react";

export function Sidebar({
  filteredContacts,
  selectedContact,
  onSelectContact,
  onDeleteChat,
  onClearAll,
  searchQuery,
  onSearchChange,
  loading,
}) {
  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b header-wa flex justify-between items-center">
        <h1 className="text-xl font-semibold">WhatsApp CRM</h1>
        <button onClick={onClearAll} className="text-white/80">
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-full text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            {loading ? "Loading..." : "Belum ada pesan"}
          </p>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.phone}
              className={`p-4 border-b group cursor-pointer transition flex justify-between items-start ${
                selectedContact === contact.phone
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                onClick={() => onSelectContact(contact.phone)}
                className="flex-1"
              >
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600 truncate">
                  {contact.lastMessage}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(contact.phone);
                }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition ml-2"
                title="Hapus chat"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
