"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Users, Info, Loader2
} from "lucide-react";
import { fetchSuperGroups, createSuperGroup, updateSuperGroup, deleteSuperGroup } from "../../../lib/api";
import {useAuth} from "@/context/AuthContext";
import BackButton from "@/components/BackButton";

export default function SupergroupsPage() {
  const [supergroups, setSupergroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupergroup, setEditingSupergroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    sgrp_code: "",
    sgrp_name: "",
    dept_name: "",
  });
  const {user,token,role} = useAuth();
  // Mock data for supergroups (since backend endpoint might not be available)
  const mockSupergroups = [
    {
      id: 1,
      sgrp_code: "SGRP-001",
      sgrp_name: "Engineering",
      sgrp_desc: "Engineering and technical departments",
      created: "2024-01-15",
      createdby: "Admin",
      updated: "2024-01-15",
      updatedby: "Admin",
    },
    {
      id: 2,
      sgrp_code: "SGRP-002", 
      sgrp_name: "Operations",
      sgrp_desc: "Operations and production departments",
      created: "2024-01-15",
      createdby: "Admin",
      updated: "2024-01-15",
      updatedby: "Admin",
    },
    {
      id: 3,
      sgrp_code: "SGRP-003",
      sgrp_name: "Administration",
      sgrp_desc: "Administrative and support departments",
      created: "2024-01-15",
      createdby: "Admin",
      updated: "2024-01-15",
      updatedby: "Admin",
    },
  ];

  // Load data on component mount
  useEffect(() => {
    loadSupergroups();
  }, []);

  const loadSupergroups = async () => {
    try {
      setLoading(true);
      setError(null);
      // const token = localStorage.getItem("token");
      const data = await fetchSuperGroups(token);
      setSupergroups(data);
    } catch (err) {
      setError("Failed to load supergroups: " + (err.response?.data?.error || err.message));
      console.error("Error loading supergroups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter supergroups
  const filteredSupergroups = supergroups.filter(supergroup => {
    const matchesSearch =
      (supergroup.sgrp_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supergroup.sgrp_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supergroup.dept_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingSupergroup(null);
    setFormData({
      sgrp_code: "",
      sgrp_name: "",
      dept_name: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (supergroup) => {
    setEditingSupergroup(supergroup);
    setFormData({
      sgrp_code: supergroup.sgrp_code,
      sgrp_name: supergroup.sgrp_name,
      dept_name: supergroup.dept_name,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupergroup(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSupergroup = async () => {
    if (!formData.sgrp_code || !formData.sgrp_name || !formData.dept_name) {
      setError("Please fill in required fields: Code, Name, and Department Name");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      // const token = localStorage.getItem("token");

      if (editingSupergroup) {
        await updateSuperGroup(token, editingSupergroup.sgrp_code, formData);
      } else {
        await createSuperGroup(token, formData);
      }

      await loadSupergroups();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save supergroup: " + (err.response?.data?.error || err.message));
      console.error("Error saving supergroup:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sgrp_code) => {
    if (window.confirm("Are you sure you want to delete this supergroup? This action cannot be undone.")) {
      try {
        setError(null);
        // const token = localStorage.getItem("token");
        await deleteSuperGroup(token, sgrp_code);
        await loadSupergroups();
      } catch (err) {
        setError("Failed to delete supergroup: " + (err.response?.data?.error || err.message));
        console.error("Error deleting supergroup:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-default text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={28} />
              Supergroups Management
            </h1>
            {/* <p className="text-gray-600">Define and manage user supergroups for organizational structure</p> */}
          </div>
          <div className="flex items-center gap-3">
            <BackButton 
              href="/governance" 
              label="Back to Governance"
            />
            {role === "MDGT" && (
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} className="mr-2" />
                Add Supergroup
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search supergroups by name, code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600 text-sm">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading supergroups...</p>
          </div>
        ) : (
          /* Supergroups Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSupergroups.length > 0 ? (
                    filteredSupergroups.map((supergroup) => (
                      <tr key={supergroup.sgrp_code} className="hover:bg-gray-50">
                        <td className="font-default px-6 py-4 text-sm font-medium text-gray-900">{supergroup.sgrp_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{supergroup.sgrp_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{supergroup.dept_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{supergroup.created}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{supergroup.createdby}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            {role === "MDGT" && (
                              <>
                                <button
                                  onClick={() => handleEdit(supergroup)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(supergroup.sgrp_code)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {supergroups.length === 0 
                          ? "No supergroups found. Add a new supergroup to get started." 
                          : "No supergroups found matching your criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        {/* <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-200">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Supergroups Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Supergroups define high-level organizational categories</li>
                <li>They help organize material groups and departments</li>
                <li>Use the search bar to find supergroups by name, code, or description</li>
                <li>Click the "Add Supergroup" button to create new organizational categories</li>
                <li>Use the edit and delete icons to modify or remove supergroups</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>

      {/* Supergroup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingSupergroup ? "Edit Supergroup" : "Add New Supergroup"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supergroup Code *</label>
                <input
                  type="text"
                  name="sgrp_code"
                  value={formData.sgrp_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SGRP-001"
                  disabled={editingSupergroup}
                />
                {editingSupergroup && (
                  <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="sgrp_name"
                  value={formData.sgrp_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engineering"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  name="dept_name"
                  value={formData.dept_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department Name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupergroup}
                disabled={saving || !formData.sgrp_code || !formData.sgrp_name || !formData.dept_name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingSupergroup ? "Save Changes" : "Add Supergroup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
