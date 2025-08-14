import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://127.0.0.1:5001/api" : "/api",
    withCredentials: true,
})