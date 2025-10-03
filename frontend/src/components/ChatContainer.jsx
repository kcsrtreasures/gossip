import { useEffect, useRef, useState } from "react"
import { axiosInstance } from "../lib/axios"
import { formatMessageTime } from "../lib/utils"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageSkeleton from "./skeletons/MessageSkeleton"


const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, isTyping, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore()
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const scrollContainerRef = useRef(null)
  const { authUser} = useAuthStore()
  const messageEndRef = useRef(null)

  const handleRemoveMessage = async (messageId) => {
    const confirmRemove = window.confirm("Unsend this message?");
    if (!confirmRemove) return;

    try {
      await axiosInstance.put(`/messages/unsend/${messageId}`);

      // Local update
      useChatStore.getState().markMessageAsRemoved(messageId);
    } catch (err) {
      console.error("Failed to unsend:", err);
    }
  };



  useEffect(() => {
    if(!selectedUser?._id) return;
    getMessages(selectedUser._id).then(() => {
      // console.log("Fetched messages:", useChatStore.getState().messages)
    })
    subscribeToMessages()
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const isNearBottom = scrollContainer &&
      scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 150

    if(messageEndRef.current && isNearBottom) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

  }, [messages])

  if(isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto" draggable={false}>
        <ChatHeader />

        <div className="flex-1 overflow-y-auto p-4 space-y-0" ref={scrollContainerRef}>
          {messages.map((message, index) => {
            // ... your existing message rendering logic
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat chat-start">
              <div className="chat-bubble bg-base-300 text-sm italic text-zinc-500">
                {selectedUser?.fullName || "User"} is typing...
              </div>
            </div>
          )}
        </div>



        <MessageSkeleton />
        <MessageInput />
      </div>
  )}
  
  return (
    <div className="flex-1 flex flex-col overflow-auto" draggable={false}>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-0" ref={scrollContainerRef}>
        {messages.map((message, index) => {
          const isMe = message.senderId === authUser._id;
          const nextMessage = messages[index + 1];

          const isLastInGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;

          const currentTime = new Date(message.createdAt);
          const nextTime = nextMessage ? new Date(nextMessage.createdAt) : null;

          const showTimestamp =
            isLastInGroup ||
            (nextTime && Math.abs(nextTime - currentTime) >= 60 * 1000); // 1 minute gap

          return (
            <div
              key={message._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"} relative group`}
              ref={index === messages.length - 1 ? messageEndRef : null}
              draggable={false}
            >
              {/* Avatar only if it's from the other user AND last in group */}
              {!isMe && isLastInGroup && (
                <div className="chat-image avatar">
                  <div className="size-7 rounded-full border">
                    <img
                      src={selectedUser.profilePic || "/vite.svg"}
                      alt="profile pic"
                      draggable={false}
                    />
                  </div>
                </div>
              )}

              {/* Timestamp shown if last in group or enough time gap */}
              {showTimestamp && (
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              )}

              <div
                className="chat-bubble"
                style={{
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {message.removed ? (
                  <span className="italic text-sm text-zinc-500">
                    {isMe ? "You unsent a message." : "This message was unsent."}
                  </span>
                ) : (
                  <>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="w-full max-w-[200px] rounded-md mb-2"
                        draggable={false}
                      />
                    )}
                    {message.text}
                  </>
                )}
              </div>


              {/* Remove button (only for your messages and not yet removed) */}
              {isMe && !message.removed && (
                <button
                  onClick={() => handleRemoveMessage(message._id)}
                  className="remove-button absolute top-1 right-1 hidden group-hover:inline-block text-xs bg-base-300 hover:bg-red-500 hover:text-white rounded px-2 py-0.5"
                >
                  Remove
                </button>
              )}



            </div>
          );
        })}


      </div>

      <MessageInput />
      
    </div>
  )
}

export default ChatContainer
