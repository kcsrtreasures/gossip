import { useChatStore } from "../store/useChatStore";

const ChatFooter = ({ message, handleChange, handleTyping, handleSend }) => {
  const { isTyping } = useChatStore();

  return (
    <div className="chat-footer">
      {isTyping && (
        <div className="typing-indicator">
          Typing...
        </div>
      )}
      <div className="chat-input-wrapper">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleTyping}
          className="chat-input"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatFooter;
