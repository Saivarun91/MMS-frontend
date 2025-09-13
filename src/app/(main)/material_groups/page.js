// app/material-groups/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Folder, Info, Loader2
} from "lucide-react";
import { 
  fetchMaterialGroups, 
  createMaterialGroup, 
  updateMaterialGroup, 
  deleteMaterialGroup 
} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
import BackButton from "@/components/BackButton";

export default function MaterialGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    mgrp_code: "",
    mgrp_shortname: "",
    mgrp_longname: "",
    sgrp_code: "",
    is_service: false,
    attribgrpid: "",
    notes: "",
  });
  const {user,token,role} = useAuth();
  // Load data on component mount
  useEffect(() => {
    loadMaterialGroups();
  }, []);

  const loadMaterialGroups = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }
      
      const data = await fetchMaterialGroups(token);
      setGroups(data || []);
    } catch (err) {
      setError("Failed to load material groups: " + (err.message || "Unknown error"));
      console.error("Error loading material groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch =
      (group.mgrp_shortname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.mgrp_longname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.mgrp_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingGroup(null);
    setFormData({
      mgrp_code: "",
      mgrp_shortname: "",
      mgrp_longname: "",
      sgrp_code: "",
      is_service: false,
      attribgrpid: "",
      notes: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      mgrp_code: group.mgrp_code,
      mgrp_shortname: group.mgrp_shortname,
      mgrp_longname: group.mgrp_longname,
      sgrp_code: group.sgrp_code?.sgrp_code || "",
      is_service: group.is_service,
      attribgrpid: group.attribgrpid || "",
      notes: group.notes || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveGroup = async () => {
    if (!formData.mgrp_code || !formData.mgrp_shortname || !formData.mgrp_longname) {
      setError("Please fill in required fields: Code, Short Name, and Long Name");
      return;
    }

    try {
      setSaving(true);
      // const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      if (editingGroup) {
        await updateMaterialGroup(token, editingGroup.mgrp_code, formData);
      } else {
        await createMaterialGroup(token, formData);
      }

      await loadMaterialGroups();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save material group: " + (err.message || "Unknown error"));
      console.error("Error saving material group:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mgrp_code) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        //  const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        await deleteMaterialGroup(token, mgrp_code);
        await loadMaterialGroups();
      } catch (err) {
        setError("Failed to delete material group: " + (err.message || "Unknown error"));
        console.error("Error deleting material group:", err);
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
              <Folder className="mr-2" size={28} />
              Material Groups Management
            </h1>
            {/* <p className="text-gray-600">Organize materials into groups for better inventory management</p> */}
          </div>
          <div className="flex items-center gap-3">
            <BackButton 
              href="/governance" 
              label="Back to Governance"
            />
            {
              role === "MDGT" && (
                <button
                  onClick={handleAddNew}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Group
                </button>
              )
            }
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search groups by name, code or description..."
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
            <p className="text-gray-600">Loading material groups...</p>
          </div>
        ) : (
          /* Groups Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Name</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Long Name</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Super Group</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <tr key={group.mgrp_code} className="hover:bg-gray-50">
                        <td className="font-default px-6 py-4 text-sm font-medium text-gray-900">{group.mgrp_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{group.mgrp_shortname}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{group.mgrp_longname}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{group.supergroup || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            group.is_service 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {group.is_service ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{group.created}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(group)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(group.mgrp_code)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        {groups.length === 0 
                          ? "No material groups found. Add a new group to get started." 
                          : "No groups found matching your criteria."}
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
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Material Groups Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Groups help organize materials into logical categories</li>
                <li>Use the search bar to find groups by name, code, or description</li>
                <li>Click the "Add Group" button to create new material categories</li>
                <li>Use the edit and delete icons to modify or remove groups</li>
                <li>Deleting a group will not delete the materials in that group</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>

      {/* Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingGroup ? "Edit Material Group" : "Add New Material Group"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Group Code *</label>
                <input
                  type="text"
                  name="mgrp_code"
                  value={formData.mgrp_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GRP-001"
                  disabled={editingGroup}
                />
                {editingGroup && (
                  <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Name *</label>
                <input
                  type="text"
                  name="mgrp_shortname"
                  value={formData.mgrp_shortname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fasteners"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Name *</label>
                <input
                  type="text"
                  name="mgrp_longname"
                  value={formData.mgrp_longname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fasteners and Hardware Components"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Super Group Code</label>
                <input
                  type="text"
                  name="sgrp_code"
                  value={formData.sgrp_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SGRP-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Group ID</label>
                <input
                  type="text"
                  name="attribgrpid"
                  value={formData.attribgrpid}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ATTR-001"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_service"
                  checked={formData.is_service}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Is Service Group
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes and description"
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
                onClick={handleSaveGroup}
                disabled={saving || !formData.mgrp_code || !formData.mgrp_shortname || !formData.mgrp_longname}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingGroup ? "Save Changes" : "Add Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}