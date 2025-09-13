"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Package, Building } from "lucide-react";

export default function Signup() {
    const [formData, setFormData] = useState({
        emp_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        company_name: "",
        description: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.emp_name) newErrors.emp_name = "Full name is required";
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (!formData.company_name) newErrors.company_name = "Company name is required";
        if (!formData.description) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/employee/register/", {
                emp_name: formData.emp_name,
                email: formData.email,
                password: formData.password,
                company_name: formData.company_name,
                description: formData.description,
            });

            console.log("Signup success:", response.data);

            // localStorage.setItem("isLoggedIn", "true");
            // localStorage.setItem("userName", formData.emp_name.split(" ")[0]);

            const event = new CustomEvent("showToast", {
                detail: { message: "Account created successfully! Redirecting...", type: "success" },
            });
            window.dispatchEvent(event);

            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);

            const event = new CustomEvent("showToast", {
                detail: { message: error.response?.data?.error || "Signup failed. Try again.", type: "error" },
            });
            window.dispatchEvent(event);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex justify-center mb-2">
                        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
                            <ArrowLeft size={16} className="mr-1" />
                            Back to home
                        </Link>
                    </div>

                    <div className="text-center">
                        <div className="bg-gradient-to-r from-[#002147] to-[#7F56D9] p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            Join Megha Materials Hub
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Create your account to access our material management system
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        name="emp_name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${errors.emp_name ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                        value={formData.emp_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.emp_name && <p className="mt-1 text-sm text-red-600">{errors.emp_name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${errors.password ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        name="company_name"
                                        type="text"
                                        placeholder="Enter your company name"
                                        className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${errors.company_name ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                        value={formData.company_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Enter a short description"
                                    className={`appearance-none relative block w-full px-3 py-3 border ${errors.description ? "border-red-300" : "border-gray-300"} rounded-lg`}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#002147] to-[#7F56D9] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
