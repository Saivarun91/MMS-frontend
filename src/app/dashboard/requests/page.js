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
          const found = data.find((r) => r.request_id == id);
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (!request)
    return <p className="p-6 text-red-600">Request not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/requests")}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Requests
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Combined Request Header + Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {request.title || "Request"}
                  </h1>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description inside same card */}
              <h2 className="font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600">
                {request.notes ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-700 mb-4">Conversation</h2>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col">
                  <div className="bg-gray-100 p-4 rounded-lg max-w-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-700">
                        AK San
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Need these bolts for the construction project.
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    18/12/2024 10:30 AM
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="bg-blue-50 p-4 rounded-lg max-w-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-700">
                        BK San
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Looking into available options.
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    19/12/2024 02:15 PM
                  </span>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar remains unchanged */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b">
                Request History
              </h2>
              {/* History and actions unchanged */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
