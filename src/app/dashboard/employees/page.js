// app/dashboard/employees/page.js
"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search, Mail, Building, Calendar, User, RefreshCw ,PlusCircle} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext"; // 👈 import AuthContext

export default function EmployeesPage() {
    const { token, user, loading, checkPermission } = useAuth(); // 👈 use token and checkPermission
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        emp_name: "",
        email: "",
        role: "",
        company_name: "",
        password: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // ✅ Format date safely
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // fallback if not ISO
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // ✅ Fetch all employees
    useEffect(() => {
        if (!token) return;
        const fetchEmployees = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/employee/list/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmployees(res.data.employees || []);
            } catch (err) {
                console.error("Error fetching employees:", err.response?.data || err.message);
            }
        };
        fetchEmployees();
    }, [token]);

    // ✅ Add or update employee
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check permissions before proceeding
        if (editingEmployee) {
            if (!checkPermission("employee", "update")) {
                setError("You don't have permission to update employees");
                return;
            }
        } else {
            if (!checkPermission("employee", "create")) {
                setError("You don't have permission to create employees");
                return;
            }
        }

        try {
            if (editingEmployee) {
                // 🔹 Update
                await axios.put(
                    `http://127.0.0.1:8000/employee/update/${editingEmployee.emp_id}/`,
                    {
                        email: formData.email,
                        emp_name: formData.emp_name,
                        role: formData.role,
                        company_name: formData.company_name,
                        password: formData.password || undefined,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

            } else {
                // 🔹 Register new employee
                await axios.post(
                    "http://127.0.0.1:8000/employee/register/",
                    {
                        email: formData.email,
                        emp_name: formData.emp_name,
                        role: formData.role,
                        company_name: formData.company_name,
                        password: formData.password,
                    },
                    token
                        ? { headers: { Authorization: `Bearer ${token}` } } // Admin creating
                        : {} // Employee self-register
                );
            }

            // Refresh employee list
            const res = await axios.get("http://127.0.0.1:8000/employee/list/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(res.data.employees || []);

            setShowModal(false);
            setFormData({ emp_name: "", email: "", role: "", company_name: "", password: "" });
            setEditingEmployee(null);
        } catch (err) {
            console.error("Error saving employee:", err.response?.data || err.message);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            emp_name: employee.emp_name,
            email: employee.email,
            role: employee.role,
            company_name: employee.company,
            password: "",
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        
        // Check permission before proceeding
        if (!checkPermission("employee", "delete")) {
            setError("You don't have permission to delete employees");
            return;
        }
        
        try {
            await axios.delete(`http://127.0.0.1:8000/employee/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(employees.filter((e) => e.emp_id !== id));
        } catch (err) {
            console.error("Error deleting employee:", err.response?.data || err.message);
        }
    };

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.emp_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p className="text-center p-6">Loading...</p>;

    return (
        <div className="p-6">
           

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 w-full border flex border-gray-200">
                <div className="relative w-5/6 mr-3">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {checkPermission("employee", "create") && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-1" />
                        Add Employee
                    </button>
                )}
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0 shadow-lg rounded-lg overflow-hidden">
                        {/* Table Header */}
                        <thead>
                            <tr className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white uppercase tracking-wide">
                                <th className="px-6 py-4 text-left text-sm font-semibold cursor-pointer select-none hover:brightness-110 transition-all duration-300">
                                    Employee
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Company
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Created
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Created By
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Updated
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Updated By
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee, index) => (
                                    <tr
                                        key={employee.emp_id}
                                        className={`transition-all duration-300 hover:bg-purple-50 ${
                                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{employee.emp_name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {employee.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{employee.role || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{employee.company || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{formatDate(employee.created)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{employee.createdby || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{formatDate(employee.updated)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{employee.updatedby || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-3">
                                                {checkPermission("employee", "update") && (
                                                    <button
                                                        onClick={() => handleEdit(employee)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {checkPermission("employee", "delete") && (
                                                    <button
                                                        onClick={() => handleDelete(employee.emp_id)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-200"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Users size={48} className="mb-4 opacity-50" />
                                            <p className="text-lg font-medium text-gray-500 mb-1">
                                                No employees found
                                            </p>
                                            <p className="text-sm">
                                                Get started by adding a new employee
                                            </p>
                                            {checkPermission("employee", "create") && (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition duration-300"
                                                >
                                                    <PlusCircle className="w-5 h-5 mr-2" />
                                                    Add New Employee
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">
                                {editingEmployee ? "Edit Employee" : "Add New Employee"}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.emp_name}
                                onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Role"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                            {!editingEmployee && (
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            )}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {editingEmployee ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}