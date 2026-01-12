import { useState, useEffect, useRef } from "react";
import { PlusIcon, EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import AppLayout from "../../../Layouts/AppLayout";
import Map from "../../../Components/Map";
import Create from "./Create";
import axios from "axios";
import toast from "react-hot-toast";
import { Menu } from "@headlessui/react";

export default function Index({ auth, locations: serverLocations }) {
    const user = auth?.user;
    const [locations, setLocations] = useState(serverLocations || []);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const locationsRef = useRef([]);

    useEffect(() => {
        const selectFirst = () => {
            if (locations.length > 0) {
                const first = locations[0];
                setSelectedPolygon(first.polygon_points);
                setSelectedLocationId(first.id);
            } else {
                setSelectedPolygon(null);
                setSelectedLocationId(null);
            }
        };
        selectFirst();
        window.addEventListener("focus", selectFirst);
        return () => window.removeEventListener("focus", selectFirst);
    }, [locations]);

    const handleCreated = (newLocation) => {
        setLocations((prev) => [newLocation, ...prev]);
        setSelectedLocationId(newLocation.id);
        setSelectedPolygon(newLocation.polygon_points);
        setShowCreate(false);
    };

    const moveToBin = async (id) => {
        const promise = axios.patch(`/setup/location/${id}/move-to-bin`);
        toast.promise(promise, {
            loading: "Moving to bin...",
            success: "Location moved to bin!",
            error: "Failed to move location",
        });

        try {
            await promise;

            // Remove the moved location from the active list
            setLocations((prev) => prev.filter((loc) => loc.id !== id));

            // If the removed location was selected, reset selection
            if (selectedLocationId === id) {
                if (locations.length > 1) {
                    const first = locations.find((loc) => loc.id !== id);
                    setSelectedLocationId(first.id);
                    setSelectedPolygon(first.polygon_points);
                } else {
                    setSelectedLocationId(null);
                    setSelectedPolygon(null);
                }
            }

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Locations"]}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Setup Locations</h1>
                        <p className="text-blue-100 mt-1">
                            Configure and manage all locations.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm md:text-base font-semibold shadow-md flex items-center gap-2 transition-all duration-200">
                        <PlusIcon className="h-5 w-5" />
                        Create New
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[60vh]">
                {/* Locations List */}
                <div className="border rounded p-4 space-y-2 overflow-y-auto">
                    {locations.length === 0 && <p className="text-gray-400 text-sm">No locations found.</p>}
                    {locations.map((loc, idx) => (
                        <div
                            key={loc.id}
                            ref={(el) => (locationsRef.current[idx] = el)}
                            className={`w-full p-3 rounded transition flex items-center justify-between gap-2
                                ${selectedLocationId === loc.id ? "bg-blue-200 border-l-4 border-blue-600" : "hover:bg-gray-300"}`}
                        >
                            <div
                                className="flex flex-col flex-1 text-left cursor-pointer"
                                onClick={() => {
                                    setSelectedPolygon(loc.polygon_points);
                                    setSelectedLocationId(loc.id);
                                }}
                            >
                                <div className="font-medium text-gray-800">{loc.location_name}</div>
                                <div className="text-xs text-gray-500">{loc.address}</div>
                            </div>

                            {/* Three-dot menu */}
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-1 rounded hover:bg-gray-100">
                                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                                </Menu.Button>

                                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => moveToBin(loc.id)}
                                                className={`w-full text-left px-4 py-2 flex items-center gap-2 ${active ? "bg-gray-100" : ""
                                                    }`}
                                            >
                                                <TrashIcon className="h-5 w-5 text-red-600" />
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-sm font-medium text-gray-700">Move to bin</span>
                                                    <p className="text-xs text-gray-500">
                                                        This action cannot be undone.
                                                    </p>
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="md:col-span-2 border rounded overflow-hidden flex flex-col h-full">
                    <Map center={[-73.935242, 40.73061]} zoom={12} polygon={selectedPolygon} className="flex-1 w-full" />
                </div>
            </div>

            {/* Slide-in Create Form */}
            {showCreate && <Create onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
        </AppLayout>
    );
}
