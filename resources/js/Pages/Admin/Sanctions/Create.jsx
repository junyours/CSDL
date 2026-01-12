import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Create({ onSuccess }) {
    const [data, setData] = useState({
        sanction_type: "",
        sanction_name: "",
        sanction_description: "",
        monetary_amount: "",
        service_time: "",
        service_time_type: "",
        status: true,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const promise = axios.post("/setup/sanction/store", data);
        
        toast.promise(promise, {
            loading: "Creating sanction...",
            success: "Sanction created successfully!",
            error: "Failed to create sanction",
        });

        try {
            await promise;

            onSuccess?.(); // auto-close modal + refresh table

            // Reset form
            setData({
                sanction_type: "",
                sanction_name: "",
                sanction_description: "",
                monetary_amount: "",
                service_time: "",
                service_time_type: "",
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

            {/* TYPE */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sanction Type
                </label>
                <select
                    value={data.sanction_type}
                    onChange={(e) =>
                        setData({ ...data, sanction_type: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.sanction_type ? "border-red-300" : "border-gray-300"
                        }`}
                >
                    <option value="">Select type</option>
                    <option value="monetary">Monetary</option>
                    <option value="service">Service</option>
                </select>
                {errors.sanction_type && (
                    <p className="text-red-600 text-sm mt-1.5">
                        {errors.sanction_type[0]}
                    </p>
                )}
            </div>

            {/* NAME */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sanction Name
                </label>
                <input
                    type="text"
                    value={data.sanction_name}
                    onChange={(e) =>
                        setData({ ...data, sanction_name: e.target.value })
                    }
                    placeholder="Enter sanction name"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.sanction_name ? "border-red-300" : "border-gray-300"
                        }`}
                />
                {errors.sanction_name && (
                    <p className="text-red-600 text-sm mt-1.5">
                        {errors.sanction_name[0]}
                    </p>
                )}
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                </label>
                <textarea
                    rows={4}
                    value={data.sanction_description}
                    onChange={(e) =>
                        setData({ ...data, sanction_description: e.target.value })
                    }
                    placeholder="Optional description"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.sanction_description
                        ? "border-red-300"
                        : "border-gray-300"
                        }`}
                />
                {errors.sanction_description && (
                    <p className="text-red-600 text-sm mt-1.5">
                        {errors.sanction_description[0]}
                    </p>
                )}
            </div>

            {/* MONETARY FIELDS */}
            {data.sanction_type === "monetary" && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Monetary Amount
                    </label>
                    <input
                        type="number"
                        value={data.monetary_amount}
                        onChange={(e) =>
                            setData({ ...data, monetary_amount: e.target.value })
                        }
                        placeholder="Enter amount"
                        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.monetary_amount
                            ? "border-red-300"
                            : "border-gray-300"
                            }`}
                    />
                    {errors.monetary_amount && (
                        <p className="text-red-600 text-sm mt-1.5">
                            {errors.monetary_amount[0]}
                        </p>
                    )}
                </div>
            )}

            {/* SERVICE FIELDS */}
            {data.sanction_type === "service" && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Service Time
                        </label>
                        <input
                            type="number"
                            value={data.service_time}
                            onChange={(e) =>
                                setData({ ...data, service_time: e.target.value })
                            }
                            placeholder="Enter service time"
                            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.service_time
                                ? "border-red-300"
                                : "border-gray-300"
                                }`}
                        />
                        {errors.service_time && (
                            <p className="text-red-600 text-sm mt-1.5">
                                {errors.service_time[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Time Type
                        </label>
                        <select
                            value={data.service_time_type}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    service_time_type: e.target.value,
                                })
                            }
                            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg ${errors.service_time_type
                                ? "border-red-300"
                                : "border-gray-300"
                                }`}
                        >
                            <option value="">Select type</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                        </select>

                        {errors.service_time_type && (
                            <p className="text-red-600 text-sm mt-1.5">
                                {errors.service_time_type[0]}
                            </p>
                        )}
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
                {processing ? "Saving..." : "Save Sanction"}
            </button>
        </form>
    );
}
