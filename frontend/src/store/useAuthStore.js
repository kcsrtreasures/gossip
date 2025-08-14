import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:5001/" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set ({ authUser: res.data })
            get().connectSocket()
        } catch (error) {
            console.log("Error in checkAuth:", error)
            set({ authUser:null })
        } finally{
            set({isCheckingAuth: false})
        }
    },
    
    signup: async (data) => {
        set ({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            // console.log("Logging in with:", data)
            set({ authUser: res.data })
            toast.success("Account created successfully.")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isSigningUp: false })
        }

    },
    
    login: async (data) => {
        set ({ isLoggingIn: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully.")

            get().connectSocket()

            if (window.opener && window.opener !== window) {
                window.opener.postMessage(
                    {
                    type: "LOGIN_SUCCESS",
                    user: {
                        fullName: res.data.fullName,
                        email: res.data.email,
                        isAdmin: res.data.isAdmin,
                    },
                    token: res.data.token, // optional: if you're sending JWT to Breads
                    },
                    "http://127.0.0.1:5501/" // ✅ VERY IMPORTANT: exact origin of KCSR Breads
                );
                window.close(); // ✅ Closes the popup window after login
            }

        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async(data) => {
        set({ isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            set({ authUser: res.data })
            toast.success("Profile updated successfully.")
        } catch (error) {
            console.log("Error in update profile.", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
            transports: ["websocket"],
        })
        socket.connect()

        set({ socket:socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds})
        })
    },
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect()
    },

}))