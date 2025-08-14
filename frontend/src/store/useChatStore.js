import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    unreadMessages: {},

    setUnreadMessages: ( userId, count ) => set((state) => ({
        unreadMessages: {...state.unreadMessages, [userId]: count }
    })),

    incrementUnread: (userId) => set((state) => ({
        unreadMessages: {
            ...state.unreadMessages,
            [userId]: (state.unreadMessages[userId] || 0) + 1
        }
    })),

    clearUnread: (userId) => set((state) => ({
        unreadMessages: { ...state.unreadMessages, [userId]: 0 }
    })),

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get("/messages/users")
            set({ users: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false})
        }
    },

    getMessages: async(userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async(messageData) => {
        const {selectedUser, messages} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({messages:[...messages, res.data]})
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    subscribeToMessages: () => {
    const { selectedUser, incrementUnread } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // When a new message is received
    socket.on("newMessage", (newMessage) => {
        const { senderId } = newMessage;

        // If not in the chat, increment unread count
        if (!selectedUser || selectedUser._id !== senderId) {
            incrementUnread(senderId);
        }

        // If message is from selected user, add it to the chat
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            set({
                messages: [...get().messages, newMessage],
            });
        }
    });

    // When a message is unsent (removed)
    socket.on("messageUnsent", ({ messageId }) => {
        const existingMessage = get().messages.find(msg => msg._id === messageId);
        const isMe = existingMessage?.senderId === useAuthStore.getState().authUser._id;

        if (!isMe) {
        toast("A message was unsent.");
        }

        set((state) => ({
        messages: state.messages.map((msg) =>
            msg._id === messageId
            ? { ...msg, removed: true, text: "", image: "" }
            : msg
        ),
        }));
    });
    },




    unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageUnsent"); // 👈 also cleanup
    },


    // todo: optimize this one later
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    markMessageAsRemoved: (messageId) => {
    set((state) => ({
        messages: state.messages.map((msg) =>
        msg._id === messageId
            ? { ...msg, removed: true, text: "", image: "" }
            : msg
        ),
    }));
    }



}))