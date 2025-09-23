"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Settings, Info, Loader2
} from "lucide-react";
import { fetchMaterialAttributes, createMaterialAttribute, updateMaterialAttribute, deleteMaterialAttribute } from "../../../lib/api";
import {useAuth} from "@/context/AuthContext";
import BackButton from "@/components/BackButton";
export default function MaterialAttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    mgrp_code: "",
    attrib_printpriority: 0,
    attrib_name: "",
    attrib_printname: "",
    attrib_name_validation: "",
    att_maxnamelen: "",
    attrib_tagname: "",
    attrib_tag_validation: "",
    attrib_maxtaglen: "",
  });
  const {user,token,role,checkPermission} = useAuth();
  // Load data on component mount
  useEffect(() => {
    loadAttributes();
  }, [token]);
  console.log("token",token);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      // const token = localStorage.getItem("token");
      const data = await fetchMaterialAttributes(token);
      console.log("data",data);
      setAttributes(data);
    } catch (err) {
      // setError("Failed to load material attributes: " + (err.response?.data?.error || err.message));
      console.error("Error loading material attributes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter attributes
  const filteredAttributes = attributes.filter(attribute => {
    const matchesSearch =
      (attribute.attrib_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attribute.attrib_printname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attribute.attrib_tagname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attribute.mgrp_code || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAttributes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttributes = filteredAttributes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingAttribute(null);
    setFormData({
      mgrp_code: "",
      attrib_printpriority: 0,
      attrib_name: "",
      attrib_printname: "",
      attrib_name_validation: "",
      att_maxnamelen: "",
      attrib_tagname: "",
      attrib_tag_validation: "",
      attrib_maxtaglen: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      mgrp_code: attribute.mgrp_code || "",
      attrib_printpriority: attribute.attrib_printpriority || 0,
      attrib_name: attribute.attrib_name || "",
      attrib_printname: attribute.attrib_printname || "",
      attrib_name_validation: attribute.attrib_name_validation || "",
      att_maxnamelen: attribute.att_maxnamelen || "",
      attrib_tagname: attribute.attrib_tagname || "",
      attrib_tag_validation: attribute.attrib_tag_validation || "",
      attrib_maxtaglen: attribute.attrib_maxtaglen || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAttribute(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAttribute = async () => {
    if (!formData.mgrp_code || !formData.attrib_name || !formData.attrib_printname || !formData.attrib_tagname) {
      setError("Please fill in required fields: Material Group Code, Attribute Name, Print Name, and Tag Name");
      return;
    }

    // Check permission before proceeding
    if (editingAttribute) {
      if (!checkPermission("attribute", "update")) {
        setError("You don't have permission to update material attributes");
        return;
      }
    } else {
      if (!checkPermission("attribute", "create")) {
        setError("You don't have permission to create material attributes");
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      // const token = localStorage.getItem("token");

      // Convert numeric fields
      const dataToSend = {
        ...formData,
        attrib_printpriority: parseInt(formData.attrib_printpriority) || 0,
        att_maxnamelen: formData.att_maxnamelen ? parseInt(formData.att_maxnamelen) : null,
        attrib_maxtaglen: formData.attrib_maxtaglen ? parseInt(formData.attrib_maxtaglen) : null,
      };

      if (editingAttribute) {
        await updateMaterialAttribute(token, editingAttribute.attrib_id, dataToSend);
      } else {
        await createMaterialAttribute(token, dataToSend);
      }

      await loadAttributes();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save material attribute: " + (err.response?.data?.error || err.message));
      console.error("Error saving material attribute:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (attrib_id) => {
    if (window.confirm("Are you sure you want to delete this material attribute? This action cannot be undone.")) {
      // Check permission before proceeding
      if (!checkPermission("attribute", "delete")) {
        setError("You don't have permission to delete material attributes");
        return;
      }
      
      try {
        setError(null);
        //  const token = localStorage.getItem("token");
        await deleteMaterialAttribute(token, attrib_id);
        await loadAttributes();
      } catch (err) {
        setError("Failed to delete material attribute: " + (err.response?.data?.error || err.message));
        console.error("Error deleting material attribute:", err);
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
              {/* <Settings className="mr-2" size={28} /> */}
              {/* Material Attributes Management */}
            </h1>
            {/* <p className="text-gray-600">Configure attributes for material groups and their validation rules</p> */}
          </div>
          <div className="flex items-center gap-3">
            {/* <BackButton 
              href="/governance" 
              label="Back to Governance"
            /> */}
            {checkPermission("attribute", "create") && (
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} className="mr-2" />
                Add Attribute
              </button>
            )}
          </div>
        </div>

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
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search attributes by name, print name, tag name, or material group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading material attributes...</p>
          </div>
        ) : (
          /* Attributes Table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 shadow-lg rounded-lg overflow-hidden">
                {/* Table Header */}
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white uppercase tracking-wide">
                    <th className="px-6 py-4 text-left text-sm font-semibold cursor-pointer select-none hover:brightness-110 transition-all duration-300">
                      Material Group
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Attribute Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Print Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Tag Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {currentAttributes.length > 0 ? (
                    currentAttributes.map((attribute, index) => (
                      <tr
                        key={attribute.attrib_id}
                        className={`transition-all duration-300 hover:bg-purple-50 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono bg-purple-50 px-2 py-1 rounded-md inline-block shadow-sm">
                            {attribute.mgrp_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{attribute.attrib_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{attribute.attrib_printname}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{attribute.attrib_tagname}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{attribute.attrib_printpriority}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{attribute.created ? new Date(attribute.created).toLocaleDateString() : '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            {checkPermission("attribute", "update") && (
                              <button
                                onClick={() => handleEdit(attribute)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {checkPermission("attribute", "delete") && (
                              <button
                                onClick={() => handleDelete(attribute.attrib_id)}
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
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Settings size={48} className="mb-4 opacity-50" />
                          <p className="text-lg font-medium text-gray-500 mb-1">
                            {attributes.length === 0 ? "No material attributes found" : "No attributes match your criteria"}
                          </p>
                          <p className="text-sm">
                            {attributes.length === 0
                              ? "Get started by adding a new material attribute"
                              : "Try adjusting your search or filter"}
                          </p>
                          {attributes.length === 0 && checkPermission("attribute", "create") && (
                            <button
                              onClick={handleAddNew}
                              className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition duration-300"
                            >
                              <PlusCircle className="w-5 h-5 mr-2" />
                              Add New Attribute
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredAttributes.length)}</span> of{' '}
                      <span className="font-medium">{filteredAttributes.length}</span> results
                    </p>
                  </div>
                  <div>
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
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Material Attributes Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Material attributes define properties and validation rules for material groups</li>
                <li>Print priority determines the order of attributes in printed material names</li>
                <li>Validation rules ensure data consistency and compliance</li>
                <li>Use the search bar to find attributes by name, print name, or material group</li>
                <li>Click the "Add Attribute" button to create new material attributes</li>
                <li>Use the edit and delete icons to modify or remove attributes</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>

      {/* Attribute Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingAttribute ? "Edit Material Attribute" : "Add New Material Attribute"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {error && (
                <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
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
                  placeholder="MGRP-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Print Priority</label>
                <input
                  type="number"
                  name="attrib_printpriority"
                  value={formData.attrib_printpriority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Name *</label>
                <input
                  type="text"
                  name="attrib_name"
                  value={formData.attrib_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Color"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Print Name *</label>
                <input
                  type="text"
                  name="attrib_printname"
                  value={formData.attrib_printname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CLR"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name Validation</label>
                <input
                  type="text"
                  name="attrib_name_validation"
                  value={formData.attrib_name_validation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Validation rule"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Name Length</label>
                <input
                  type="number"
                  name="att_maxnamelen"
                  value={formData.att_maxnamelen}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name *</label>
                <input
                  type="text"
                  name="attrib_tagname"
                  value={formData.attrib_tagname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="color"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Validation</label>
                <input
                  type="text"
                  name="attrib_tag_validation"
                  value={formData.attrib_tag_validation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tag validation rule"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tag Length</label>
                <input
                  type="number"
                  name="attrib_maxtaglen"
                  value={formData.attrib_maxtaglen}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
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
                onClick={handleSaveAttribute}
                disabled={saving || !formData.mgrp_code || !formData.attrib_name || !formData.attrib_printname || !formData.attrib_tagname}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingAttribute ? "Save Changes" : "Add Attribute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
