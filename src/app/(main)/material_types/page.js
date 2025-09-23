// app/material-types/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Tag, Info, Loader2
} from "lucide-react";
import { 
  fetchMaterialTypes, 
  createMaterialType, 
  updateMaterialType, 
  deleteMaterialType 
} from "@/lib/api";
import {useAuth} from "@/context/AuthContext"; 

export default function MaterialTypesPage() {
  const [types, setTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [formData, setFormData] = useState({
    mat_type_code: "",
    mat_type_desc: "",
  });
  const {user,token,role,checkPermission} = useAuth();
  // Load data on component mount
  useEffect(() => {
    loadMaterialTypes();
  }, [token]);

  const loadMaterialTypes = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
   
      
      const data = await fetchMaterialTypes(token);
      setTypes(data || []);
    } catch (err) {
      setError("Failed to load material types: " + (err.message || "Unknown error"));
      console.error("Error loading material types:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter types
  const filteredTypes = types.filter(type => {
    const matchesSearch =
      (type.mat_type_desc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.mat_type_code || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTypes = filteredTypes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingType(null);
    setFormData({
      mat_type_code: "",
      mat_type_desc: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      mat_type_code: type.mat_type_code,
      mat_type_desc: type.mat_type_desc,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveType = async () => {
    if (!formData.mat_type_code || !formData.mat_type_desc) {
      setError("Please fill in required fields: Code and Description");
      return;
    }

    // Check permission before proceeding
    if (editingType) {
      if (!checkPermission("type", "update")) {
        setError("You don't have permission to update material types");
        return;
      }
    } else {
      if (!checkPermission("type", "create")) {
        setError("You don't have permission to create material types");
        return;
      }
    }

    try {
      setSaving(true);
      // const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      if (editingType) {
        await updateMaterialType(token, editingType.mat_type_code, formData);
      } else {
        await createMaterialType(token, formData);
      }

      await loadMaterialTypes();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save material type: " + (err.message || "Unknown error"));
      console.error("Error saving material type:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mat_type_code) => {
    if (window.confirm("Are you sure you want to delete this type? This action cannot be undone.")) {
      // Check permission before proceeding
      if (!checkPermission("type", "delete")) {
        setError("You don't have permission to delete material types");
        return;
      }
      
      try {
        //  const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        await deleteMaterialType(token, mat_type_code);
        await loadMaterialTypes();
      } catch (err) {
        setError("Failed to delete material type: " + (err.message || "Unknown error"));
        console.error("Error deleting material type:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {/* <h1 className="font-default text-2xl font-bold text-gray-800 flex items-center">
              <Tag className="mr-2" size={28} />
              Material Types Management
            </h1> */}
            {/* <p className="text-gray-600">Categorize materials by type for better inventory classification</p> */}
          </div>
          <div className="flex items-center gap-3">
            {/* <BackButton 
              href="/governance" 
              label="Back to Governance"
            /> */}
            {checkPermission("type", "create") && (
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} className="mr-2" />
                Add Type
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
                placeholder="Search types by name, code or description..."
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
            <p className="text-gray-600">Loading material types...</p>
          </div>
        ) : (
          /* Types Table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-0">
      <thead className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-md">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none">
            Code
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            Description
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            Created By
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            Updated
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {currentTypes.length > 0 ? (
          currentTypes.map((type, index) => (
            <tr
              key={type.mat_type_code}
              className={`transition-all duration-200 ${
                index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
              } hover:bg-purple-50`}
            >
              <td className="px-6 py-4">
                <div className="inline-block px-2 py-1 bg-purple-100 text-purple-800 font-mono rounded-lg shadow-sm text-sm">
                  {type.mat_type_code}
                </div>
              </td>
              <td className="px-6 py-4 text-gray-900 text-sm">{type.mat_type_desc}</td>
              <td className="px-6 py-4 text-gray-900 text-sm">{type.created}</td>
              <td className="px-6 py-4 text-gray-900 text-sm">{type.createdby || "N/A"}</td>
              <td className="px-6 py-4 text-gray-900 text-sm">{type.updated}</td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  {checkPermission("type", "update") && (
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition duration-200"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {checkPermission("type", "delete") && (
                    <button
                      onClick={() => handleDelete(type.mat_type_code)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition duration-200"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
              {types.length === 0 
                ? "No material types found. Add a new type to get started." 
                : "No types found matching your criteria."}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-gray-50">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, filteredTypes.length)}</span> of{' '}
          <span className="font-medium">{filteredTypes.length}</span> results
        </p>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  )}
</div>
        )}

        {/* Info Section */}
        {/* <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-200">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Material Types Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Types help classify materials based on their stage in the production process</li>
                <li>Use the search bar to find types by name, code, or description</li>
                <li>Click the "Add Type" button to create new material classifications</li>
                <li>Use the edit and delete icons to modify or remove types</li>
                <li>Deleting a type will not delete the materials of that type</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>

      {/* Type Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingType ? "Edit Material Type" : "Add New Material Type"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Type Code *</label>
                <input
                  type="text"
                  name="mat_type_code"
                  value={formData.mat_type_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TYPE-001"
                  disabled={editingType}
                />
                {editingType && (
                  <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="mat_type_desc"
                  value={formData.mat_type_desc}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Material type description and purpose"
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
                onClick={handleSaveType}
                disabled={saving || !formData.mat_type_code || !formData.mat_type_desc}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingType ? "Save Changes" : "Add Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}