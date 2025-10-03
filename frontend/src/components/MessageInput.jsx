import { Image, Loader, Loader2, Send, X } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { useChatStore } from "../store/useChatStore"

const MessageInput = () => {
    const [ text, setText ] = useState("")
    const [ imagePreview, setImagePreview ] = useState(null)
    const [ isSending, setIsSending ] = useState(false)
    const fileInputRef = useRef(null)
    const { sendMessage } = useChatStore()

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

        setIsSending(true)
        try {
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
            setIsSending(false)
        }
    }
    
  return ( 
    <div className="p-4 w-full">
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
                    disabled={isSending}
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
                placeholder={isSending ? "Sending..." : "Type a message.."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSending}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                />
                <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isSending}
                />
                <button
                type="button"
                className={`btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-500"} btn-sm sm:btn-md`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                >
                    <Image size={18} />
                </button>
            </div>
            <button
                type="submit"
                className="btn btn-sm sm:btn-md btn-circle  "
                disabled={isSending || (!text.trim() && !imagePreview)}
            >
                {isSending ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20}  />
                )}
            </button>
        </form>
    </div>
  )
}

export default MessageInput
