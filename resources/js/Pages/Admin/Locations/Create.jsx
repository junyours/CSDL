import { useState } from "react";
import MapDraw from "../../../Components/MapDraw";
import axios from "axios";
import toast from "react-hot-toast";

export default function Create({ onClose, onCreated }) {
    const [locationName, setLocationName] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState(1);
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [locationPhoto, setLocationPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!polygonPoints || polygonPoints.length < 3) {
            setErrors({ polygon_points: ["A polygon must have at least 3 points."] });
            return;
        }

        const fd = new FormData();
        fd.append("location_name", locationName);
        fd.append("address", address);
        fd.append("status", status ? 1 : 0);
        fd.append("polygon_points", JSON.stringify(polygonPoints));
        if (locationPhoto) fd.append("location_photo", locationPhoto);

        setLoading(true);

        // Create Axios Promise
        const promise = axios.post("/setup/location/store", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // Toast promise
        toast.promise(promise, {
            loading: "Saving location...",
            success: "Location created successfully!",
            error: "Failed to create location",
        });

        try {
            const res = await promise;

            // After success: pass data back to parent
            if (res?.data?.data) {
                onCreated?.(res.data.data);
            } else if (res?.data) {
                onCreated?.(res.data);
            }

            onClose?.(); // auto close panel

            // Reset fields
            setLocationName("");
            setAddress("");
            setPolygonPoints([]);
            setLocationPhoto(null);

        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: ["Something went wrong."] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40">
                <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[640px] bg-white shadow-2xl overflow-auto">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Create Location</h2>
                        <button onClick={onClose} className="px-3 py-1 rounded border">
                            Close
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* Location Name */}
                        <div>
                            <label className="block text-sm font-medium">Location Name</label>
                            <input
                                type="text"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                className="mt-1 block w-full border rounded p-2"
                                required
                            />
                            {errors.location_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.location_name[0]}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 block w-full border rounded p-2"
                                required
                            />
                            {errors.address && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.address[0]}
                                </p>
                            )}
                        </div>

                        {/* Map Drawing */}
                        <div>
                            <label className="block text-sm font-medium">
                                Draw Geofence (click to add points)
                            </label>
                            <div className="mt-2 border rounded overflow-hidden">
                                <MapDraw
                                    initialPoints={[]}
                                    onChange={(pts) => setPolygonPoints(pts)}
                                />
                            </div>

                            {errors.polygon_points && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.polygon_points[0]}
                                </p>
                            )}
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <p className="text-red-600 text-sm">{errors.general[0]}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            {loading ? "Saving..." : "Save Location"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
