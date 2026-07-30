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
import { useEffect, useRef, useState } from "react";
import socket from "../sockets/socket";
import { useAuthGuard } from "../hooks/useAuthGuard";
import api from "../api/axios";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

interface SearchUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  online?: boolean;
}

interface Room {
  id: string;
  name: string | null;
  type: string;
  members: SearchUser[];
}

interface Message {
  _id: string;
  content: string;
  sender_id: { _id: string; name: string };
  createdAt: string;
}

const ChatRoom = () => {
  useAuthGuard(); // just call it directly, the hook handles useEffect internally

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // NEW
  const [message, setMessage] = useState(""); // NEW
  const [prevMessages, setPrevMessages] = useState<Message[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room>();
  const [dms, setDms] = useState<SearchUser[]>([]);
  const [channels, setChannels] = useState<SearchUser[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const activeRoomRef = useRef<Room | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const { user } = useUser();
  const navigate = useNavigate();
  // on user click in search results:
  const startDM = async (userId: string) => {
    const res = await api.post("/rooms/dm", { memberId: userId });
    setActiveRoom(res.data.data); // set active room

    setDms((prev) => {
      const merged = [...prev, res.data.data];
      return merged.filter((room, index, self) => {
        return index === self.findIndex((r) => r._id === room._id);
      });
    });
    setSearchQuery(""); // clear search
    setSearchOpen(false); // close search
  };

  const getOtherMember = (searchUser: SearchUser[]) => {
    let currentUserId = user?.sub;
    return searchUser.filter((m) => m.id !== currentUserId);
  };

  const handleSearch = async (query: string) => {
    await api
      .get(`/users/search?query=${query}`)
      .then((res) => {
        setSearchResults(res.data.data);
      })
      .catch((err) => {
        console.error("Error searching users:", err);
      });
  };

  const fetchRecentDms = async () => {
    await api
      .post("/rooms/recent/dms")
      .then((res) => {
        setDms(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching recent DMs:", err);
      });
  };

  const fetchRecentChannels = async () => {
    await api
      .post("/rooms/recent/channels")
      .then((res) => {
        setChannels(res.data.data);
        console.log("activemRoom1");
        setActiveRoom(res.data.data[0]);
      })
      .catch((err) => {
        console.error("Error fetching recent Channels:", err);
      });
  };

  const fetchMessages = async (roomId: string, cursorId?: string) => {
    try {
      const url = cursorId
        ? `/rooms/${roomId}/messages?cursor=${cursorId}&limit=20`
        : `/rooms/${roomId}/messages?limit=20`;

      const res = await api.get(url);
      const newMessages = res.data.data || [];

      if (cursorId) {
        // prepend older messages at top
        setPrevMessages((prev) => [...newMessages, ...prev]);
      } else {
        // initial load — just set
        setPrevMessages(newMessages);
      }

      // set cursor to oldest message _id for next load
    } catch (err) {
      console.error("fetchMessages failed:", err);
      setPrevMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prevMessages]);

  const fetchActiveRoomData = (roomId: string, type = "dms") => {
    let roomData = [];
    if (type == "dms") {
      roomData = dms.find((elem) => elem.id === roomId);
    } else {
      roomData = channels.find((elem) => elem.id === roomId);
    }
    setActiveRoom(roomData);
  };

  const logout = async () => {
    await api.delete("/auth/logout");
    localStorage.removeItem("token");
    window.location.href = "/";
    setSettingsOpen(false);
  };

  const sendMessage = () => {
    if (!message.trim() || !activeRoom?.id) return;

    socket.emit("send_message", {
      roomId: activeRoom.id,
      content: message,
    });

    setMessage(""); // clear input
  };

  useEffect(() => {
    fetchRecentDms();
    fetchRecentChannels();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // fake messages for now
  // const messages = [
  //   {
  //     id: 1,
  //     sender: "JC",
  //     name: "Jane Cooper",
  //     time: "10:32 AM",
  //     text: "Hey team! The new design is looking great 🎨",
  //     mine: false,
  //   },
  //   {
  //     id: 2,
  //     sender: "AR",
  //     name: "Alex Ray",
  //     time: "10:35 AM",
  //     text: "Agreed! Can we ship it this week?",
  //   },
  //   {
  //     id: 3,
  //     sender: "ME",
  //     name: "You",
  //     time: "10:37 AM",
  //     text: "Yes! I'll have it ready by Thursday 🚀",
  //     mine: true,
  //   },
  //   {
  //     id: 4,
  //     sender: "JC",
  //     name: "Jane Cooper",
  //     time: "10:40 AM",
  //     text: "Perfect. Let's sync tomorrow morning.",
  //     mine: false,
  //   },
  // ];

  const joinRoom = (roomId: string) => {
    socket.emit("join_room", roomId, (ack) => {
      console.log("join_room ack:", ack); // fires only when server confirms
    });
  };
  useEffect(() => {
    activeRoomRef.current = activeRoom;

    if (activeRoom?.id) {
      setPrevMessages([]); // clear old messages
      fetchMessages(activeRoom.id); // load fresh
      const timer = setTimeout(() => {
        if (socket.connected) {
          joinRoom(activeRoom.id);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [activeRoom]);

  useEffect(() => {
    console.log("ChatRoom SOCKET EFFECT mounted");

    socket.on("connect", () => {
      console.log("connected:", socket.id);
      if (activeRoomRef.current?.id) {
        joinRoom(activeRoomRef.current.id);
      }
      socket.emit("get_online_users", {}, (res) => {
        setOnlineUsers(new Set(res.onlineUsers));
      });
    });

    socket.on("disconnect", () => console.log("disconnected"));

    // ADD THIS
    socket.on("receive_message", (msg) => {
      console.log("new message received:", msg);
      setPrevMessages((prev) => [...prev, msg]);
    });

    // inside socket useEffect
    socket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message"); // cleanup
      socket.disconnect();
    };
  }, []);

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
            {channels.length > 0 &&
              channels.map((channel) => (
                <div
                  className="flex flex-row items-center bg-[#032042] ml-3 mr-3 p-1 rounded-md cursor-pointer"
                  onClick={() => fetchActiveRoomData(channel.id, "channel")}
                >
                  <div className="pl-2 pr-2 text-left text-[0.8rem] flex-1">
                    <div className="flex items-center gap-1">
                      <Hash size={12} className="text-[#6da7ec]" />
                      <span className="text-[#6da7ec]">{channel.name}</span>
                    </div>
                  </div>

                  <div className="text-[0.8rem] bg-white text-[#333] rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="pl-3 pr-3 text-left text-[0.8rem] text-[#888]">
            DMS
          </div>
          {dms.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {dms.map((dm) => {
                const contacts = getOtherMember(dm?.members);
                if (!contacts) return null;
                return contacts.map((contact) => {
                  return (
                    <div
                      key={dm.id}
                      className={`flex flex-row p-2 gap-2 items-center ml-2 mr-2 ${activeRoom?.id == dm.id ? "bg-[#1a1a1a]" : ""} rounded-md hover:bg-[#1a1a1a] cursor-pointer`}
                      onClick={() => fetchActiveRoomData(dm.id)}
                    >
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.75rem]">
                          {contact.initials}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0d0d0d] ${onlineUsers.has(contact.id) ? "bg-green-500" : "bg-[#555]"}`}
                        ></div>
                      </div>
                      <div className="text-white text-[0.85rem]">
                        {contact.name}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>
        <div className="mt-auto pt-3 pb-3 flex flex-row gap-2 items-center border-t border-[#1f1f1e] px-3 relative">
          <div className="w-7 h-7 rounded-full bg-[#1d1649] text-[#a096eb] flex items-center justify-center text-[0.75rem]">
            ME
          </div>
          <span className="text-white text-[0.85rem]">{user?.name}</span>

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
                onClick={() => {
                  navigate("/update-profile");
                }}
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
                onClick={() => {
                  navigate("/change-password");
                  setSettingsOpen(false);
                }}
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
                  logout();
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-row p-3 items-center border-b border-[#FFFFFF1A] bg-[#111111]">
            <button
              className="md:hidden mr-3 text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {activeRoom?.name ? (
              <div className="flex items-center gap-1 text-[#888] font-medium text-[0.95rem] h-7">
                <Hash size={14} />
                <span>{activeRoom.name}</span>
              </div>
            ) : (
              activeRoom && (
                <div className="relative">
                  {(() => {
                    const contact = getOtherMember(activeRoom?.members);
                    if (!contact) return null;

                    return (
                      <div className="w-7 h-7 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.75rem]">
                        {contact[0].initials}
                        <div
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0d0d0d] ${onlineUsers.has(contact[0].id) ? "bg-green-500" : "bg-[#555]"}`}
                        ></div>
                      </div>
                    );
                  })()}
                </div>
              )
            )}
            {/* right side icons */}
            <div className="ml-auto flex items-center gap-3">
              <Users
                size={18}
                className="text-[#888] cursor-pointer hover:text-white"
                onClick={() => setMembersOpen((state) => !state)}
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
            <div className="px-4 py-2 border-b border-[#FFFFFF1A] bg-[#111111] relative">
              <input
                type="text"
                placeholder="Search people to message..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white text-[0.85rem] rounded-md px-3 py-2 border border-[#2c2c2a] focus:outline-none focus:border-[#6da7ec]"
              />

              {/* results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-[#1a1a1a] border border-[#2c2c2a] rounded-lg overflow-hidden z-50">
                  {searchResults.map((user) => (
                    <div
                      key={user?.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#2c2c2a] cursor-pointer"
                      onClick={() => startDM(user.id)}
                    >
                      {/* avatar with online dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.75rem] font-medium">
                          {user.initials}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#1a1a1a] ${user.online ? "bg-green-500" : "bg-[#555]"}`}
                        />
                      </div>

                      {/* name + email */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-[0.85rem] font-medium text-left">
                          {user.name}
                        </span>
                        <span className="text-[#555] text-[0.75rem] truncate">
                          {user.email}
                        </span>
                      </div>

                      {/* message hint */}
                      <span className="ml-auto text-[#555] text-[0.75rem] flex-shrink-0">
                        Message
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* no results */}
              {searchQuery.length > 0 && searchResults.length === 0 && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-[#1a1a1a] border border-[#2c2c2a] rounded-lg px-3 py-3 z-50">
                  <span className="text-[#555] text-[0.85rem]">
                    No users found for "{searchQuery}"
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
            {prevMessages.map((msg) => {
              const mine = msg.sender_id?._id === user?.sub;
              const initials = msg.sender_id?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="relative group">
                    {activeRoom?.type === "channel" && (
                      <>
                        <div
                          title={msg.sender_id?.name}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-medium flex-shrink-0 ${
                            mine
                              ? "bg-[#1d1649] text-[#a096eb]"
                              : "bg-[#11260f] text-[#0ca30c]"
                          }`}
                        >
                          {initials}
                        </div>

                        <div className="absolute bottom-full right-[-2rem] -translate-x-1/2 mb-1 px-2 py-1 bg-[#2c2c2a] text-white text-[0.7rem] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                          {msg.sender_id?.name}
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    className={`flex flex-col max-w-[70%] ${mine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-3 py-1 rounded-lg text-[0.85rem] ${mine ? "bg-[#032042] text-[#6da7ec] rounded-tr-none" : "bg-[#1a1a1a] text-white rounded-tl-none border border-[#2c2c2a]"}`}
                    >
                      {msg.content}
                      <div
                        className={`flex items-baseline gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <span className="text-[#555] text-[0.7rem]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {mine && (
                      <span className="text-[0.65rem] text-[#555] mt-1">
                        Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
            <div ref={messagesEndRef} /> {/* add this at the very end */}
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
              placeholder="Message"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-[#1a1a1a] text-white text-[0.85rem] rounded-md px-3 py-2 border border-[#2c2c2a] focus:outline-none focus:border-[#6da7ec]"
            />
            <button
              onClick={sendMessage}
              className="bg-[#032042] hover:bg-[#053060] p-2 rounded-md flex-shrink-0"
            >
              <Send size={16} className="text-[#6da7ec]" />
            </button>
          </div>
        </div>
      </div>
      {activeRoom &&
        (() => {
          const contacts = getOtherMember(activeRoom.members) ?? [];
          return (
            <div
              className={`
      bg-[#0d0d0d] border-l border-[#1f1f1e] flex flex-col
      transition-all duration-200 overflow-hidden
      ${membersOpen ? "w-[220px]" : "w-0"}
    `}
            >
              <div className="flex flex-row p-3 items-center border-b border-[#FFFFFF1A] bg-[#111111]">
                <div className="flex items-center gap-1 text-white font-medium text-[0.95rem]">
                  Members
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[#888] cursor-pointer hover:text-white text-[.9rem]">
                    {contacts.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col mt-4">
                <div className="flex flex-col gap-1 mt-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex flex-row p-2 gap-2 items-center ml-2 mr-2 rounded-md"
                    >
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-[#11260f] text-[#0ca30c] flex items-center justify-center text-[0.75rem]">
                          {contact.initials}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0d0d0d] ${onlineUsers.has(contact.id) ? "bg-green-500" : "bg-[#555]"}`}
                        ></div>
                      </div>
                      <div className="text-white text-[0.85rem]">
                        {contact.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default ChatRoom;
