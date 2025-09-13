"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);  // 👈 add loading
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedRole = localStorage.getItem("role");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
        }

        setLoading(false); // 👈 done loading
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/employee/login/`, {
                email,
                password,
            });

            const data = res.data;

            setToken(data.token);
            setUser({ email: data.email, emp_name: data.emp_name });
            setRole(data.role);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({ email: data.email, emp_name: data.emp_name }));
            localStorage.setItem("role", data.role);

            router.push("/app");
            return { success: true, data };
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, role, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
