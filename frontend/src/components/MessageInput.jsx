import { Image, Loader2, Send, X } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { useChatStore } from "../store/useChatStore"

const MessageInput = () => {
    const [ text, setText ] = useState("")
    const [ imagePreview, setImagePreview ] = useState(null)
    const [ sending, setSending ] = useState(false)
    const fileInputRef = useRef(null)
    const { sendMessage, sendTyping, isTyping } = useChatStore()

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if(!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return;
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSendMessage = async(e) => {
        e.preventDefault()
        if(!text.trim() && !imagePreview) return;
        if (sending) return

        try {
            setSending(true)
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // Clear form
            setText("")
            setImagePreview(null)
            if (fileInputRef.current) fileInputRef.current.value =""; 
        } catch (error) {
            console.error("Failed to send message:", error)     
            toast.error("Message failed to send")    
        } finally {
            setSending(false)
        }
    }

    const handleTyping = (e) => {
        setText(e.target.value)
        if (sendTyping) {
            sendTyping()
        }
    }
    
  return ( 
    <div className="p-4 w-full">
              {/* Show typing indicator */}
        {isTyping && (
            <div className="text-xs text-zinc-500 mb-2 italic animate-pulse">
            Typing...
            </div>
        )}

        {imagePreview && (
            <div className="mb-3 flex items-center gap-2">
                <div className="relative">
                    <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                    />
                    <button 
                    onClick={removeImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                    type="button"
                    disabled={sending}
                    >
                        <X className="size-3" />
                    </button>
                </div>  
            </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 flex gap-2">
                <input 
                type="text"
                className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                placeholder={sending ? "Sending..." : "Type a message.."}
                value={text}
                onChange={handleTyping}
                disabled={sending}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                />
                <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={sending}
                />
                <button
                type="button"
                className={`btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-500"} btn-sm sm:btn-md`}
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                >
                    <Image size={18} />
                </button>
            </div>
            <button
                type="submit"
                className="btn btn-sm sm:btn-md btn-circle  "
                disabled={sending || (!text.trim() && !imagePreview)}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}

            </button>
        </form>
    </div>
  )
}

export default MessageInput
