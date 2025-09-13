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
    // if (typeof window !== "undefined") {
    //   localStorage.removeItem("isLoggedIn");
    //   localStorage.removeItem("userName");
    // }
    window.location.href = "/login";
  };
  
  const stats = [
    { label: "Total Materials", value: "1,248", change: "+12% from last month", icon: FiPackage },
    { label: "Active Requests", value: "42", change: "+5% from last week", icon: FiShoppingCart },
    { label: "Catalog Growth", value: "28%", change: "+8% from last quarter", icon: FiTrendingUp }
  ];
  
  const materialGroups = [
    { code: "MEASTMULT", name: "MEASURING TOOLS / INSTRUMENTS – MULTIMETER ELECTRICAL" },
    { code: "GASESARGO", name: "GASES – ARGON" },
    { code: "GASESNITR", name: "GASES – NITROGEN" },
    { code: "GASESOXYG", name: "GASES – OXYGEN" },
    { code: "GASESAMMO", name: "GASES – AMMONIA" },
    { code: "FASTBOLT", name: "FASTENERS – BOLTS" },
    { code: "FASTNUTS", name: "FASTENERS – NUTS" },
    { code: "TOOLSHAND", name: "TOOLS – HAND TOOLS" },
    { code: "TOOLPOWR", name: "TOOLS – POWER TOOLS" },
    { code: "ELECWIRE", name: "ELECTRICAL – WIRES & CABLES" },
    { code: "PLUMBPIPE", name: "PLUMBING – PIPES & FITTINGS" },
    { code: "SAFTPERS", name: "SAFETY – PERSONAL PROTECTIVE EQUIPMENT" },
  ];

  const filteredGroups = materialGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupSelect = (code) => setSelectedGroup(code);
  const handleSelectClick = () => {
    if (selectedGroup) router.push(`/materials/${selectedGroup}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Full-width container */}
      
      <div className="w-full bg-white shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-800 text-white p-6 w-full">
          <h1 className="text-2xl font-bold">Material & Service Catalog</h1>
        </div>
        
        
        
        {/* Breadcrumb */}
        {/* <div className="flex p-4 bg-gray-100 text-sm text-gray-600 w-full">
          <span className="cursor-pointer hover:text-blue-600">Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-blue-600">Procurement</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-blue-600">Material Search</span>
        </div> */}
        
        {/* Main content */}
      
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
              <button className="bg-blue-600 text-white py-2 px-6 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                Search
              </button>
              <button className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
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
              <span className="text-sm text-gray-500">{filteredGroups.length} results</span>
            </div>
            
            <div className="border border-gray-200 rounded-md h-72 overflow-y-auto shadow-inner">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div
                    key={group.code}
                    onClick={() => handleGroupSelect(group.code)}
                    className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                      selectedGroup === group.code ? "bg-blue-100 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="font-semibold text-blue-700">{group.code}</div>
                    <div className="text-sm text-gray-600">{group.name}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No material groups found. Try a different search term.
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
        
        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-500 w-full">
          © 2023 Company Name. All rights reserved. | v2.4.1
        </div>
      </div>
    </div>
  );
}
