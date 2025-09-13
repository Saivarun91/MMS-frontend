// app/dashboard/employees/page.js
"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search, Mail, Building, Calendar, User, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext"; // 👈 import AuthContext

export default function EmployeesPage() {
    const { token, user, loading } = useAuth(); // 👈 use token
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-blue-600" />
                    Employee Management
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Employee
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">Employee</th>
                                <th className="p-4 text-left">Role</th>
                                <th className="p-4 text-left">Company</th>
                                <th className="p-4 text-left">Created</th>
                                <th className="p-4 text-left">Created By</th>
                                <th className="p-4 text-left">Updated</th>
                                <th className="p-4 text-left">Updated By</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.emp_id}>
                                    <td className="p-4 flex items-center gap-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium">{employee.emp_name}</div>
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {employee.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{employee.role || "N/A"}</td>
                                    <td className="p-4">{employee.company || "N/A"}</td>
                                    <td className="p-4">{formatDate(employee.created)}</td>
                                    <td className="p-4">{employee.createdby || "N/A"}</td>
                                    <td className="p-4">{formatDate(employee.updated)}</td>
                                    <td className="p-4">{employee.updatedby || "N/A"}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(employee)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(employee.emp_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No employees found</p>
                    </div>
                )}
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