import { useState, useEffect } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import { TrashIcon } from "@heroicons/react/24/outline";

export default function Update({ auth, violation, onSuccess }) {
    const [data, setData] = useState({
        violation_code: "",
        violation_description: "",
        status: true,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Prefill form with existing violation data
    useEffect(() => {
        if (violation) {
            setData({
                violation_code: violation.violation_code || "",
                violation_description: violation.violation_description || "",
                status: !!violation.status,
            });
        }
    }, [violation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // 🔥 PATCH URL without Ziggy
        const updateUrl = `/setup/violation/${violation.id}`;

        // Debugging logs
        console.log("Update URL:", updateUrl);
        console.log("Payload:", data);

        const promise = axios.patch(updateUrl, data);

        toast.promise(promise, {
            loading: 'Updating violation...',
            success: 'Violation updated successfully!',
            error: 'Failed to update violation',
        });

        try {
            await promise;
            onSuccess?.();
            setData({
                violation_code: "",
                violation_description: "",
                status: true,
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="violation_code" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Violation Code
                </label>
                <input
                    id="violation_code"
                    type="text"
                    value={data.violation_code}
                    onChange={(e) => setData({ ...data, violation_code: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border ${errors.violation_code ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400`}
                    placeholder="Enter violation code"
                />
                {errors.violation_code && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.violation_code[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="violation_description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                </label>
                <textarea
                    id="violation_description"
                    value={data.violation_description}
                    onChange={(e) => setData({ ...data, violation_description: e.target.value })}
                    rows={4}
                    className={`w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border ${errors.violation_description ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400`}
                    placeholder="Describe the violation"
                />
                {errors.violation_description && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.violation_description[0]}</p>
                )}
            </div>

            <div
                className={`flex flex-col gap-1 transition-all ${data.status === 0 ? "border border-red-500 rounded-lg p-2" : ""
                    }`}
            >
                <div className="flex items-center justify-between">

                    {/* Icon + Text */}
                    <div className="flex items-center gap-2">
                        <TrashIcon className="h-5 w-5 text-red-600" />

                        <div className="flex flex-col justify-center">
                            <label htmlFor="status" className="text-sm font-medium text-gray-700">
                                Move to bin
                            </label>
                            <p className="text-xs text-gray-500">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            id="status"
                            type="checkbox"
                            checked={data.status === 0}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    status: e.target.checked ? 0 : 1,
                                })
                            }
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>

                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? 'Updating...' : 'Update Violation'}
            </button>
        </form>
    );
}
