"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchRequests } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (token) {
          const data = await fetchRequests(token);
          const found = data.find(r => r.request_id == id);
          setRequest(found);
        }
      } catch (err) {
        console.error("Error loading request:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!request) return <p className="p-6 text-red-600">Request not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/requests")}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Requests
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Combined Request Header and Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{request.title || "Request"}</h1>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md mr-2">
                      {request.request_code || `REQ-${id}`}
                    </span>
                    <span className="text-sm text-gray-500">• Material</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                    High Priority
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    {request.status || "Open"}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Combined Info Grid */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> */}
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requester</p>
                  <p className="font-medium text-gray-800">{request.created_by || "AK San"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                  <p className="font-medium text-gray-800">{request.assigned_to || "BK San"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Created Date</p>
                  <p className="font-medium text-gray-800">
                    {request.created ? new Date(request.created).toLocaleDateString('en-GB') : "18/12/2024"}
                  </p>
                </div> */}
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Updated</p>
                  <p className="font-medium text-gray-800">
                    {request.updated ? new Date(request.updated).toLocaleDateString('en-GB') : "19/12/2024"}
                  </p>
                </div> */}
              {/* </div> */}
              
              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="font-semibold text-gray-700 mb-3">Description</h2>
                <p className="text-gray-600">{request.notes || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}</p>
              </div>
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-700 mb-4">Conversation</h2>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col">
                  <div className="bg-gray-100 p-4 rounded-lg max-w-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-700">AK San</span>
                    </div>
                    <p className="text-gray-600 text-sm">Need these bolts for the construction project.</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">18/12/2024 10:30 AM</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="bg-blue-50 p-4 rounded-lg max-w-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-700">BK San</span>
                    </div>
                    <p className="text-gray-600 text-sm">Looking into available options.</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">19/12/2024 02:15 PM</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => console.log("Send:", message)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Request History</h2>
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Created</p>
                    <p>By AK San on 18/12/2024</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Assigned to BK San</p>
                    <p>By System on 18/12/2024</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Updated</p>
                    <p>By BK San on 19/12/2024</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full py-2.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  Mark In Progress
                </button>
                
                <button className="w-full py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                
                <button className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Close Request
                </button>
                
                <button className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}