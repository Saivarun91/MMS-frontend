"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";            
import { FiPackage, FiTrendingUp, FiShoppingCart } from "react-icons/fi";
import { LogOut } from "lucide-react";

export default function MaterialSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("material");
  const [selectedGroup, setSelectedGroup] = useState("");
  const router = useRouter();   

  const handleLogout = () => {
    window.location.href = "/login";
  };
  
  const stats = [
    { label: "Total Materials", value: "1,248", change: "+12% from last month", icon: FiPackage },
    { label: "Active Requests", value: "42", change: "+5% from last week", icon: FiShoppingCart },
    { label: "Catalog Growth", value: "28%", change: "+8% from last quarter", icon: FiTrendingUp }
  ];
  
  // backend results + loading (you already added these — keep them)
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // === REPLACED: remove filteredGroups computed from undefined materialGroups ===
  // const filteredGroups = materialGroups.filter(...)
  // Instead use the backend results directly:
  const displayGroups = results;

  const handleGroupSelect = (code) => setSelectedGroup(code);
  const handleSelectClick = () => {
    if (selectedGroup) router.push(`/materials/${selectedGroup}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full bg-white shadow-md overflow-hidden">
        

        <div className="flex flex-col md:flex-row p-6 w-full">
          {/* Left Section - Search */}
          <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-6 mb-6 md:mb-0">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Search Criteria</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={selectedType === "material"}
                    onChange={() => setSelectedType("material")}
                  />
                  <span className="text-gray-700">Material</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={selectedType === "service"}
                    onChange={() => setSelectedType("service")}
                  />
                  <span className="text-gray-700">Service</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Enter material or service description here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              {/* Search button - calls backend */}
              <button
                onClick={async () => {
                  if (!searchTerm.trim()) return;
                  setLoading(true);
                  try {
                    // Use your API host here. You can change to env var: process.env.NEXT_PUBLIC_API_BASE
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/matgroups/search/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query: searchTerm })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setResults(data);
                    } else {
                      setResults([]);
                    }
                  } catch (err) {
                    console.error("Search failed:", err);
                    setResults([]);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !searchTerm.trim()}
                className={`py-2 px-6 rounded-md shadow focus:outline-none transition-colors ${
                  loading || !searchTerm.trim()
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Searching..." : "Search"}
              </button>

              {/* Clear button */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setResults([]);
                  setSelectedGroup("");
                }}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md shadow hover:bg-gray-300"
              >
                Clear
              </button>
            </div>

            {/* Recent Searches */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-200">Electrical wires</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-200">Safety equipment</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-200">Hand tools</span>
              </div>
            </div>
          </div>

          {/* Right Section - Results */}
          <div className="flex flex-col w-full md:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Material Groups</h2>
              <span className="text-sm text-gray-500">
                {loading ? "Searching..." : `${displayGroups.length} results`}
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-md h-72 overflow-y-auto shadow-inner">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : displayGroups.length > 0 ? (
                displayGroups.map((group) => {
                  // support both backend keys and legacy keys
                  const code = group.mgrp_code ?? group.code;
                  const name = group.notes;
                 const rank = group.rank ?? "";
                  return (
                    <div
                      key={code}
                      onClick={() => handleGroupSelect(code)}
                      className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedGroup === code ? "bg-blue-100 border-l-4 border-l-blue-600" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
  <div>
    <div className="font-semibold text-blue-700">{code}</div>
    <div className="text-sm text-gray-600">{name}</div>
  </div>
  <div className="text-xs bg-green-400 text-white p-2 font-mono rounded-md">
    Rank: {rank}
  </div>
</div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.trim()
                    ? "No material groups found. Try a different search term."
                    : "No material groups shown. Enter a search term and click Search."}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button className="bg-red-600 text-white py-2 px-6 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex-1">
                Material Group Not Found
              </button>
              
              <button 
                onClick={handleSelectClick}
                disabled={!selectedGroup}
                className={`py-2 px-6 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex-1 ${
                  selectedGroup 
                    ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Select Group
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md transition-colors">Create New Request</button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md transition-colors">View Favorites</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-500 w-full">
          © 2023 Company Name. All rights reserved. | v2.4.1
        </div>
      </div>
    </div>
  );
}
