"use client";

import { useState, useRef } from "react";
import { Download, UploadCloud, FileText, ChevronDown, Info } from "lucide-react";
import { Toast } from "@/components/Toast";

export default function UploadPage() {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const templates = ["Requests", "Employees", "Material Groups"];

    const triggerToast = (type, message) => {
        window.dispatchEvent(new CustomEvent('showToast', {
            detail: { type, message }
        }));
    };

    const handleDownload = () => {
        if (!selectedTemplate) {
            triggerToast("error", "Please select a template first!");
            return;
        }

        // Simulate download process
        triggerToast("success", `Downloading ${selectedTemplate} template...`);

        // Example: trigger template download (replace with real endpoint)
        const link = document.createElement("a");
        link.href = `/templates/${selectedTemplate.toLowerCase()}.xlsx`;
        link.download = `${selectedTemplate}_template.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.xlsx', '.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validTypes.includes(fileExtension)) {
            triggerToast("error", "Please upload only Excel or CSV files");
            return;
        }

        // Simulate upload process
        setIsUploading(true);
        setUploadProgress(0);

        const uploadInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(uploadInterval);
                    setIsUploading(false);
                    triggerToast("success", `${file.name} uploaded successfully!`);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        console.log("File uploaded:", file.name);
        // TODO: Replace with actual API call
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const event = { target: { files: [file] } };
            handleFileUpload(event);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center p-6">
            <div className="w-full max-w-5xl">
                {/* Toast Component */}
                <Toast />

                {/* Page Heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Data Management Portal
                    </h1>
                    <p className="text-gray-600">
                        Download templates and upload data for your organization
                    </p>
                </div>

                {/* Template Selector */}
                <div className="mb-8 bg-white rounded-2xl shadow-md p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Data Template
                    </label>
                    <div className="relative">
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="w-full md:w-1/2 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 pr-10 appearance-none bg-white"
                        >
                            <option value="">-- Choose a template --</option>
                            {templates.map((tpl) => (
                                <option key={tpl} value={tpl}>
                                    {tpl}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 md:mr-48">
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Flex Layout - only show if a template is selected */}
                {selectedTemplate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Download Template Section */}
                        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col transition-all hover:shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="p-3 rounded-full bg-indigo-100 mr-4">
                                    <Download className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Download Template
                                </h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">
                                Get the pre-formatted Excel template for the selected table. Ensure you use the correct format to avoid upload errors.
                            </p>
                            <button
                                onClick={handleDownload}
                                disabled={!selectedTemplate}
                                className="mt-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow hover:bg-indigo-700 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download {selectedTemplate} Template
                            </button>
                        </div>

                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col transition-all hover:shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="p-3 rounded-full bg-green-100 mr-4">
                                    <UploadCloud className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Upload Data
                                </h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">
                                Upload your filled Excel file to insert records into{" "}
                                {selectedTemplate}. Files should be in .xlsx or .csv format.
                            </p>

                            {/* Upload Box */}
                            <label
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isUploading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {isUploading ? (
                                    <div className="w-full px-6">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-indigo-600 h-2.5 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-indigo-600 mt-3">
                                            Uploading... {uploadProgress}%
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 text-center px-4">
                                            Drag & drop your file here or click to browse
                                        </span>
                                        <span className="text-xs text-gray-400 mt-2">
                                            Supports .xlsx, .csv files
                                        </span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.csv"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}