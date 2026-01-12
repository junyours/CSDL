import { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

export default function Create({ auth, onSuccess }) {
    const [data, setData] = useState({
        violation_code: "",
        violation_description: "",
        status: true,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const promise = axios.post(route("setup.violation.store"), data);

        toast.promise(promise, {
            loading: 'Creating violation...',
            success: 'Violation created successfully!',
            error: 'Failed to create violation',
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
                // Optional: show more specific error if needed
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

            <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? 'Saving...' : 'Save Violation'}
            </button>
        </form>
    );
}