import {
  MessageCircle,
  Search,
  Settings,
  Menu,
  X,
  Paperclip,
  Send,
  Hash,
  Users,
} from "lucide-react";
import { useState } from "react";

const ChatRoom = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // NEW
  const [message, setMessage] = useState(""); // NEW
  const [settingsOpen, setSettingsOpen] = useState(false);

  // fake messages for now
  const messages = [
    {
      id: 1,
      sender: "JC",
      name: "Jane Cooper",
      time: "10:32 AM",
      text: "Hey team! The new design is looking great 🎨",
      mine: false,
    },
    {
      id: 2,
      sender: "AR",
      name: "Alex Ray",
      time: "10:35 AM",
      text: "Agreed! Can we ship it this week?",
      mine: false,
    },
    {
      id: 3,
      sender: "ME",
      name: "You",
      time: "10:37 AM",
      text: "Yes! I'll have it ready by Thursday 🚀",
      mine: true,
    },
    {
      id: 4,
      sender: "JC",
      name: "Jane Cooper",
      time: "10:40 AM",
      text: "Perfect. Let's sync tomorrow morning.",
      mine: false,
    },
  ];
  

  return (
    <div className="flex flex-row w-full h-screen">
      {/* overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar — your existing code unchanged */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0d0d0d] flex flex-col gap-2
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:w-[360px]
      `}
      >
        <div className="p-3 flex flex-row gap-2 items-center border-b border-[#1f1f1e]">
          <div className="w-10 h-10 rounded-xl bg-[#032042] flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#6da7ec]" />
          </div>
          <span className="text-white font-semibold">WorkChat</span>
          <button
            className="md:hidden ml-auto text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col">
          <div className="pl-3 pr-3 text-left text-[0.8rem] text-[#888]">
            CHANNELS
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-row bg-[#032042] ml-3 mr-3 p-1 rounded-md">
              <div className="pl-3 pr-3 text-left text-[0.8rem] flex-1">
                <span className="text-[#6da7ec]"># general</span>
              </div>
              <div className="text-[0.8rem] bg-[#fff] text-[#333] rounded-full w-5 h-5 flex items-center justify-center">
                2
              </div>
            </div>
            <div className="flex flex-row ml-3 mr-3 p-1 rounded-md hover:bg-[#1a1a1a] cursor-pointer">
              <div className="pl-3 pr-3 text-left text-[0.8rem] flex-1">
                <span className="text-[#888]"># random</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="pl-3 pr-3 text-left text-[0.8rem] text-[#888]">
            DMS
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex flex-row p-2 gap-2 items-center ml-2 mr-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.75rem]">
                  JC
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#0d0d0d]"></div>
              </div>
              <div className="text-white text-[0.85rem]">Jane Cooper</div>
            </div>
            <div className="flex flex-row p-2 gap-2 items-center ml-2 mr-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#1d1649] text-[#a096eb] flex items-center justify-center text-[0.75rem]">
                  AR
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#888] rounded-full border border-[#0d0d0d]"></div>
              </div>
              <div className="text-white text-[0.85rem]">Alex Ray</div>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-3 pb-3 flex flex-row gap-2 items-center border-t border-[#1f1f1e] px-3 relative">
          <div className="w-7 h-7 rounded-full bg-[#1d1649] text-[#a096eb] flex items-center justify-center text-[0.75rem]">
            ME
          </div>
          <span className="text-white text-[0.85rem]">You</span>

          {/* Settings icon */}
          <Settings
            size={16}
            className="ml-auto text-[#888] cursor-pointer hover:text-white"
            onClick={() => setSettingsOpen(!settingsOpen)}
          />

          {/* Dropdown menu */}
          {settingsOpen && (
            <div className="absolute bottom-14 left-3 right-3 bg-[#1a1a1a] border border-[#2c2c2a] rounded-lg overflow-hidden z-50">
              {/* Profile */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#2c2c2a] cursor-pointer"
                onClick={() => setSettingsOpen(false)}
              >
                <div className="w-7 h-7 rounded-full bg-[#1d1649] text-[#a096eb] flex items-center justify-center text-[0.75rem]">
                  ME
                </div>
                <div>
                  <div className="text-white text-[0.8rem] font-medium text-left">
                    Your Profile
                  </div>
                  <div className="text-[#888] text-[0.7rem]">
                    Edit name & avatar
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2c2c2a]" />

              {/* Change password */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#2c2c2a] cursor-pointer"
                onClick={() => setSettingsOpen(false)}
              >
                <div className="w-7 h-7 rounded-full bg-[#0d0d0d] flex items-center justify-center">
                  <Settings size={14} className="text-[#888]" />
                </div>
                <div className="text-white text-[0.8rem]">Change Password</div>
              </div>

              <div className="border-t border-[#2c2c2a]" />

              {/* Logout */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#2c2c2a] cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                  setSettingsOpen(false);
                }}
              >
                <div className="w-7 h-7 rounded-full bg-[#2a0d0d] flex items-center justify-center">
                  <X size={14} className="text-red-400" />
                </div>
                <div className="text-red-400 text-[0.8rem]">Logout</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-row p-3 items-center border-b border-[#FFFFFF1A] bg-[#111111]">
          <button
            className="md:hidden mr-3 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Hash size={16} className="text-[#888] mr-1" />
          <span className="text-white font-medium text-[0.95rem]">general</span>

          {/* right side icons */}
          <div className="ml-auto flex items-center gap-3">
            <Users
              size={18}
              className="text-[#888] cursor-pointer hover:text-white"
            />
            <Search
              size={18}
              className="text-[#888] cursor-pointer hover:text-white"
              onClick={() => setSearchOpen(!searchOpen)}
            />
          </div>
        </div>

        {/* Search bar — conditionally shown */}
        {searchOpen && (
          <div className="px-4 py-2 border-b border-[#FFFFFF1A] bg-[#111111]">
            <input
              type="text"
              placeholder="Search messages..."
              autoFocus
              className="w-full bg-[#1a1a1a] text-white text-[0.85rem] rounded-md px-3 py-2 border border-[#2c2c2a] focus:outline-none focus:border-[#6da7ec]"
            />
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.mine ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* avatar */}
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-medium flex-shrink-0
                ${msg.mine ? "bg-[#1d1649] text-[#a096eb]" : "bg-[#11260f] text-[#0ca30c]"}
              `}
              >
                {msg.sender}
              </div>

              {/* bubble */}
              <div
                className={`flex flex-col max-w-[70%] ${msg.mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-baseline gap-2 mb-1 ${msg.mine ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span className="text-white text-[0.8rem] font-medium">
                    {msg.name}
                  </span>
                  <span className="text-[#555] text-[0.7rem]">{msg.time}</span>
                </div>
                <div
                  className={`
                  px-3 py-2 rounded-lg text-[0.85rem]
                  ${
                    msg.mine
                      ? "bg-[#032042] text-[#6da7ec] rounded-tr-none"
                      : "bg-[#1a1a1a] text-white rounded-tl-none border border-[#2c2c2a]"
                  }
                `}
                >
                  {msg.text}
                </div>
                {/* read receipt — only on your messages */}
                {msg.mine && (
                  <span className="text-[0.65rem] text-[#555] mt-1">Read</span>
                )}
              </div>
            </div>
          ))}

          {/* typing indicator */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.65rem]">
              JC
            </div>
            <span className="text-[#555] text-[0.75rem] italic">
              Jane is typing
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#555] animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-[#FFFFFF1A] bg-[#111111] flex items-center gap-2">
          <button className="text-[#888] hover:text-white flex-shrink-0">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setMessage("")}
            placeholder="Message #general"
            className="flex-1 bg-[#1a1a1a] text-white text-[0.85rem] rounded-md px-3 py-2 border border-[#2c2c2a] focus:outline-none focus:border-[#6da7ec]"
          />
          <button
            onClick={() => setMessage("")}
            className="bg-[#032042] hover:bg-[#053060] p-2 rounded-md flex-shrink-0"
          >
            <Send size={16} className="text-[#6da7ec]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
