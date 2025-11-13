"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus, Edit, Trash2, Search, Settings, Info, Loader2, PlusCircle, X, Eye
} from "lucide-react";
import { fetchMaterialAttributes, createMaterialAttribute, updateMaterialAttribute, deleteMaterialAttribute, fetchMaterialGroups } from "../../../lib/api";
import {useAuth} from "@/context/AuthContext";
import BackButton from "@/components/BackButton";
import SearchableDropdown from "@/components/SearchableDropdown";
import ViewModal from "@/components/ViewModal";

// Component to display attributes as badges with overflow handling
function AttributeBadges({ attributes }) {
  const containerRef = useRef(null);
  const badgeRefs = useRef({});
  const [visibleCount, setVisibleCount] = useState(Object.keys(attributes).length);

  useEffect(() => {
    const calculateVisibleCount = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      if (containerWidth === 0) return;
      
      const attrEntries = Object.entries(attributes);
      if (attrEntries.length === 0) {
        setVisibleCount(0);
        return;
      }
      
      const gap = 8; // gap-2 = 8px
      const moreBadgeWidth = 55; // Approximate width for "+X" badge
      let usedWidth = 0;
      let count = 0;
      
      // Try to fit badges one by one
      for (let i = 0; i < attrEntries.length; i++) {
        const [attrName] = attrEntries[i];
        const badgeElement = badgeRefs.current[attrName];
        
        if (badgeElement) {
          const badgeWidth = badgeElement.offsetWidth;
          const remainingCount = attrEntries.length - i - 1;
          
          // Check if we need space for "+X more" badge
          const neededForMore = remainingCount > 0 ? moreBadgeWidth + gap : 0;
          
          if (usedWidth + badgeWidth + gap + neededForMore <= containerWidth) {
            usedWidth += badgeWidth + gap;
            count++;
          } else {
            // Can't fit this badge, show "+X more" instead
            break;
          }
        } else {
          // If badge not rendered yet, estimate width
          const estimatedWidth = Math.max(50, attrName.length * 7 + 24) + gap;
          const remainingCount = attrEntries.length - i - 1;
          const neededForMore = remainingCount > 0 ? moreBadgeWidth + gap : 0;
          
          if (usedWidth + estimatedWidth + neededForMore <= containerWidth) {
            usedWidth += estimatedWidth;
            count++;
          } else {
            break;
          }
        }
      }
      
      setVisibleCount(Math.max(0, count));
    };

    // Initial calculation after DOM update
    const timeoutId = setTimeout(calculateVisibleCount, 50);
    
    // Use ResizeObserver for container size changes
    let resizeObserver;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(calculateVisibleCount, 10);
      });
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', calculateVisibleCount);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateVisibleCount);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [attributes]);

  const attrEntries = Object.entries(attributes);
  const visibleAttributes = attrEntries.slice(0, visibleCount);
  const hiddenCount = attrEntries.length - visibleCount;

  if (attrEntries.length === 0) {
    return (
      <span className="text-sm text-gray-400 italic">No attributes</span>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2 max-w-full">
      {visibleAttributes.map(([attrName, attrConfig]) => (
        <span
          key={attrName}
          ref={(el) => badgeRefs.current[attrName] = el}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200 whitespace-nowrap"
          title={`${attrName}: ${attrConfig.values?.join(", ") || "N/A"}`}
        >
          {attrName}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm cursor-default whitespace-nowrap"
          title={`${hiddenCount} more attribute${hiddenCount > 1 ? 's' : ''}: ${attrEntries.slice(visibleCount).map(([name]) => name).join(", ")}`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

export default function MaterialAttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [materialGroups, setMaterialGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAttribute, setViewingAttribute] = useState(null);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    mgrp_code: "",
    attributes: {}, // JSON structure: { "Color": { "values": ["Red", "Blue"], "print_priority": 1, ... } }
  });
  
  // For adding new attribute in form
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");
  const [newAttrPrintPriority, setNewAttrPrintPriority] = useState(0);
  const [newAttrValidation, setNewAttrValidation] = useState("");
  const [newAttrMaxLength, setNewAttrMaxLength] = useState("");
  const [newAttrUnit, setNewAttrUnit] = useState("");
  
  const {user,token,role,checkPermission} = useAuth();
  
  // Load data on component mount
  useEffect(() => {
    if (token) {
      loadAttributes();
      loadMaterialGroups();
    }
  }, [token]);


  const loadAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMaterialAttributes(token);
      setAttributes(data || []);
    } catch (err) {
      setError("Failed to load material attributes: " + (err.response?.data?.error || err.message));
      console.error("Error loading material attributes:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterialGroups = async () => {
    try {
      const data = await fetchMaterialGroups(token);
      setMaterialGroups(data || []);
    } catch (err) {
      console.error("Error loading material groups:", err);
    }
  };

  // Filter attributes
  const filteredAttributes = attributes.filter(attribute => {
    const matchesSearch =
      (attribute.mgrp_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(attribute.attributes || {}).some(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase())
      );

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

  // Modal handlers
  const handleAddNew = () => {
    setEditingAttribute(null);
    setFormData({
      mgrp_code: "",
      attributes: {},
    });
    setNewAttrName("");
    setNewAttrValues("");
    setNewAttrPrintPriority(0);
    setNewAttrValidation("");
    setNewAttrMaxLength("");
    setNewAttrUnit("");
    setIsModalOpen(true);
    setError(null);
  };

  const handleView = (attribute) => {
    setViewingAttribute(attribute);
    setIsViewModalOpen(true);
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      mgrp_code: attribute.mgrp_code || "",
      attributes: attribute.attributes || {},
    });
    setNewAttrName("");
    setNewAttrValues("");
    setNewAttrPrintPriority(0);
    setNewAttrValidation("");
    setNewAttrMaxLength("");
    setNewAttrUnit("");
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAttribute(null);
    setError(null);
  };


  const addAttributeToForm = () => {
    if (!newAttrName || !newAttrValues) {
      setError("Attribute name and values are required");
      return;
    }

    // Check if unit is required for numeric validation
    if (newAttrValidation.toLowerCase() === "numeric" && !newAttrUnit) {
      setError("Unit to measure is required when validation is numeric");
      return;
    }

    const valuesArray = newAttrValues.split(",").map(v => v.trim()).filter(v => v);
    if (valuesArray.length === 0) {
      setError("At least one value is required");
      return;
    }

    const newAttr = {
      values: valuesArray,
      print_priority: parseInt(newAttrPrintPriority) || 0,
    };

    if (newAttrValidation) {
      newAttr.validation = newAttrValidation;
    }

    if (newAttrMaxLength) {
      newAttr.max_length = parseInt(newAttrMaxLength);
    }

    // Add unit if validation is numeric
    if (newAttrValidation.toLowerCase() === "numeric" && newAttrUnit) {
      newAttr.unit = newAttrUnit;
    }

    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [newAttrName]: newAttr
      }
    }));

    // Reset form
    setNewAttrName("");
    setNewAttrValues("");
    setNewAttrPrintPriority(0);
    setNewAttrValidation("");
    setNewAttrMaxLength("");
    setNewAttrUnit("");
    setError(null);
  };

  const removeAttributeFromForm = (attrName) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[attrName];
    setFormData(prev => ({
      ...prev,
      attributes: newAttributes
    }));
  };

  const handleSaveAttribute = async () => {
    if (!formData.mgrp_code) {
      setError("Material Group Code is required");
      return;
    }

    if (Object.keys(formData.attributes).length === 0) {
      setError("At least one attribute must be defined");
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

      const dataToSend = {
        mgrp_code: formData.mgrp_code,
        attributes: formData.attributes,
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
                placeholder="Search attributes by material group or attribute name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Material Group</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Attributes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Updated</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
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
                          <AttributeBadges attributes={attribute.attributes || {}} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {attribute.created ? new Date(attribute.created).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {attribute.updated ? new Date(attribute.updated).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleView(attribute)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition duration-200"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
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
                      <td colSpan="5" className="px-6 py-12 text-center">
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
      </div>

      {/* Attribute Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingAttribute ? "Edit Material Attribute" : "Add New Material Attribute"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}
              
              {/* Material Group Selection */}
              <div>
                <SearchableDropdown
                  label="Material Group Code *"
                  options={materialGroups}
                  value={formData.mgrp_code}
                  onChange={(value) => setFormData(prev => ({ ...prev, mgrp_code: value || "" }))}
                  placeholder="Select material group..."
                  searchPlaceholder="Search material groups..."
                  required
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.mgrp_code ? `${option.mgrp_code} - ${option.mgrp_shortname || option.mgrp_longname || ''}` : (option.mgrp_shortname || option.mgrp_longname || String(option));
                  }}
                  getOptionValue={(option) => {
                    if (typeof option === 'string') return option;
                    return option.mgrp_code || option;
                  }}
                />
              </div>

              {/* Add New Attribute Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Attribute</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Name *</label>
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Color"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Values (comma-separated) *</label>
                    <input
                      type="text"
                      value={newAttrValues}
                      onChange={(e) => setNewAttrValues(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Red, Blue, Green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Print Priority</label>
                    <input
                      type="number"
                      value={newAttrPrintPriority}
                      onChange={(e) => setNewAttrPrintPriority(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validation</label>
                    <select
                      value={newAttrValidation}
                      onChange={(e) => {
                        setNewAttrValidation(e.target.value);
                        // Clear unit if validation is not numeric
                        if (e.target.value.toLowerCase() !== "numeric") {
                          setNewAttrUnit("");
                        }
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select validation type</option>
                      <option value="alpha">Alpha</option>
                      <option value="numeric">Numeric</option>
                      <option value="alphanumeric">Alphanumeric</option>
                    </select>
                  </div>
                  {newAttrValidation.toLowerCase() === "numeric" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit to Measure *</label>
                      <input
                        type="text"
                        value={newAttrUnit}
                        onChange={(e) => setNewAttrUnit(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., kg, m, cm, liters"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                    <input
                      type="number"
                      value={newAttrMaxLength}
                      onChange={(e) => setNewAttrMaxLength(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addAttributeToForm}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Plus size={18} className="mr-2" />
                      Add Attribute
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Attributes */}
              {Object.keys(formData.attributes).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Defined Attributes</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.attributes).map(([attrName, attrConfig]) => (
                      <div key={attrName} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{attrName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Values: {attrConfig.values?.join(", ") || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Priority: {attrConfig.print_priority || 0}
                              {attrConfig.validation && ` | Validation: ${attrConfig.validation}`}
                              {attrConfig.unit && ` | Unit: ${attrConfig.unit}`}
                              {attrConfig.max_length && ` | Max Length: ${attrConfig.max_length}`}
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttributeFromForm(attrName)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                            title="Remove"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                disabled={saving || !formData.mgrp_code || Object.keys(formData.attributes).length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingAttribute ? "Save Changes" : "Add Attribute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingAttribute(null);
        }}
        data={viewingAttribute}
        title="View Material Attribute Details"
        fieldLabels={{
          attrib_id: "Attribute ID",
          mgrp_code: "Material Group Code",
          attributes: "Attributes",
          created: "Created",
          updated: "Updated"
        }}
      />
    </div>
  );
}
