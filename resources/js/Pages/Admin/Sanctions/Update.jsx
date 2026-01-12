import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function Update({ sanction, onSuccess }) {
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

    // Prefill
    useEffect(() => {
        if (sanction) {
            setData({
                sanction_type: sanction.sanction_type,
                sanction_name: sanction.sanction_name,
                sanction_description: sanction.sanction_description || "",
                monetary_amount: sanction.monetary_amount || "",
                service_time: sanction.service_time || "",
                service_time_type: sanction.service_time_type || "",
                status: !!sanction.status,
            });
        }
    }, [sanction]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const updateUrl = `/setup/sanction/${sanction.id}`;

        const promise = axios.patch(updateUrl, data);

        toast.promise(promise, {
            loading: "Updating sanction...",
            success: "Sanction updated successfully!",
            error: "Failed to update sanction",
        });

        try {
            await promise;
            onSuccess?.(); // close modal + refresh
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* SANCTION TYPE */}
            <div>
                <label className="block text-sm font-medium mb-1.5">Sanction Type</label>
                <select
                    value={data.sanction_type}
                    onChange={e => setData({ ...data, sanction_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="">Select type</option>
                    <option value="monetary">Monetary</option>
                    <option value="service">Service</option>
                </select>
                {errors.sanction_type && <p className="text-red-600 text-sm">{errors.sanction_type[0]}</p>}
            </div>

            {/* NAME */}
            <div>
                <label className="block text-sm font-medium mb-1.5">Sanction Name</label>
                <input
                    type="text"
                    value={data.sanction_name}
                    onChange={e => setData({ ...data, sanction_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.sanction_name && <p className="text-red-600 text-sm">{errors.sanction_name[0]}</p>}
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                    rows={4}
                    value={data.sanction_description}
                    onChange={e => setData({ ...data, sanction_description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.sanction_description && (
                    <p className="text-red-600 text-sm">{errors.sanction_description[0]}</p>
                )}
            </div>

            {/* MONETARY FIELDS */}
            {data.sanction_type === "monetary" && (
                <div>
                    <label className="block text-sm font-medium mb-1.5">Monetary Amount</label>
                    <input
                        type="number"
                        value={data.monetary_amount}
                        onChange={e => setData({ ...data, monetary_amount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    {errors.monetary_amount && (
                        <p className="text-red-600 text-sm">{errors.monetary_amount[0]}</p>
                    )}
                </div>
            )}

            {/* SERVICE FIELDS */}
            {data.sanction_type === "service" && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Service Time</label>
                        <input
                            type="number"
                            value={data.service_time}
                            onChange={e => setData({ ...data, service_time: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        {errors.service_time && (
                            <p className="text-red-600 text-sm">{errors.service_time[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Time Type</label>
                        <select
                            value={data.service_time_type}
                            onChange={e => setData({ ...data, service_time_type: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">Select type</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                        </select>

                        {errors.service_time_type && (
                            <p className="text-red-600 text-sm">{errors.service_time_type[0]}</p>
                        )}
                    </div>
                </>
            )}

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
                className="w-full px-4 py-2.5 text-white bg-blue-600 rounded-lg"
            >
                {processing ? "Updating..." : "Update Sanction"}
            </button>
        </form>
    );
}
