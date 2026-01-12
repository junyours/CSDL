import AppLayout from "../../../Layouts/AppLayout";
import { PlusIcon } from "@heroicons/react/20/solid";
import {
    CalendarIcon,
    ClockIcon,
    ExclamationCircleIcon,
    InboxIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import Create from "./Create";
import { useState } from "react";
import Modal from "../../../Components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";
import Update from "./Update";

const formatTime = (time) => {
    if (!time) return null;

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Function to generate event status badge
const getEventStatus = (eventDateStr) => {
    const today = new Date();
    const eventDate = new Date(eventDateStr);
    const diffTime = eventDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Today", color: "bg-green-100 text-green-800" };
    if (diffDays === 1) return { text: "Tomorrow", color: "bg-blue-100 text-blue-800" };
    if (diffDays === -1) return { text: "Yesterday", color: "bg-red-100 text-red-800" };

    if (diffDays > 1) return { text: `${diffDays} days to go`, color: "bg-blue-100 text-blue-800" };
    if (diffDays < -1) return { text: `${Math.abs(diffDays)} days ago`, color: "bg-gray-200 text-gray-700" };

    return { text: "", color: "" };
};

export default function Index({ auth, events }) {
    const user = auth?.user;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState(null);
    const [loadingCreate, setLoadingCreate] = useState(false); // loading state

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateData, setUpdateData] = useState(null);

    const refreshEvents = () => {
        router.reload({ only: ["events"] });
    };

    const handleOpenCreate = async () => {
        setLoadingCreate(true); // start loading
        try {
            await toast.promise(
                (async () => {
                    const { data } = await axios.get("/event/create"); // hits create() controller
                    setCreateData(data); // { sanctions, locations, school_structure }
                    setShowCreateModal(true);
                })(),
                {
                    loading: "Please wait while preparing the form...",
                    success: "Form ready!",
                    error: "Failed to prepare form",
                }
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCreate(false); // stop loading
        }
    };

    const handleOpenUpdate = async (eventId) => {
        await toast.promise(
            axios.get(`/event/${eventId}/edit`).then(res => {
                setUpdateData(res.data);
                setShowUpdateModal(true);
            }),
            {
                loading: "Loading event...",
                success: "Event ready",
                error: "Failed to load event",
            }
        );
    };

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Events"]}>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
                        <p className="text-blue-100 mt-1">
                            Configure and manage all events in one place.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        disabled={loadingCreate} // disable button while loading
                        className={`bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm md:text-base font-semibold shadow-md flex items-center gap-2 transition-all duration-200 ${loadingCreate ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                    >
                        {loadingCreate ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-blue-700"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="h-5 w-5" />
                                Create New Event
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Event Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                {events.length > 0 ? (
                    events.map((event) => {
                        const status = getEventStatus(event.event_date);

                        return (
                            <div
                                key={event.id}
                                className="
                        relative bg-white border border-gray-200 rounded-xl
                        shadow-sm hover:shadow-lg transition-all duration-300
                        flex flex-col h-full
                    "
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-gray-100 flex justify-between items-start relative">
                                    <div className="min-w-0">
                                        <h1 className="text-xl font-semibold text-gray-800 truncate">
                                            {event.event_name}
                                        </h1>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>
                                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {status.text && (
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    )}

                                    {/* Cancelled Badge */}
                                    {event.is_cancelled ? (
                                        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium text-white bg-red-600 rounded-full">
                                            Cancelled
                                        </span>
                                    ) : null}

                                </div>


                                {/* Body */}
                                <div className="p-5 space-y-4 flex-1">
                                    <div className="flex flex-col items-start gap-1 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="h-4 w-4 text-gray-500" />
                                            {event.attendance_type === "single" ? (
                                                <span className="font-medium">
                                                    {formatTime(event.start_time)} – {formatTime(event.end_time)}
                                                </span>
                                            ) : (
                                                <span className="font-medium">
                                                    {formatTime(event.first_start_time)} – {formatTime(event.first_end_time)}
                                                    <span className="mx-1 text-gray-400">|</span>
                                                    {formatTime(event.second_start_time)} – {formatTime(event.second_end_time)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-600 ml-6">{event.attendance_duration} minute/s attendance duration</span>
                                    </div>


                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium truncate">
                                            {event.location?.location_name || "No location"}
                                        </span>

                                        <span className="truncate">
                                            {event.location?.address || "No location"}
                                        </span>
                                    </div>

                                    {/* Sanction */}
                                    {event.sanction && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <ExclamationCircleIcon className="h-4 w-4 mt-0.5 text-gray-500" />
                                            <span className="font-medium truncate">
                                                {event.sanction.sanction_name}
                                            </span>

                                            {event.sanction.sanction_type === "monetary" && (
                                                <p className="truncate">
                                                    ₱{Number(event.sanction.monetary_amount).toLocaleString()}
                                                </p>
                                            )}

                                            {event.sanction.sanction_type === "service" && (
                                                <p className="truncate">
                                                    {event.sanction.service_time} {event.sanction.service_time_type}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Participants */}
                                    <div className="space-y-2">
                                        {/* Courses */}
                                        <div className="flex flex-wrap gap-2">
                                            {event.participant_courses?.map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium"
                                                >
                                                    {c.course_name_abbreviation}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Year Levels */}
                                        <div className="flex flex-wrap gap-2">
                                            {event.participant_year_levels?.map((y) => (
                                                <span
                                                    key={y.id}
                                                    className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium"
                                                >
                                                    {y.year_level_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-4 px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        View
                                    </button>
                                    {/* Only render the Update button if the event is not already done */}
                                    {status.text !== "Yesterday" && !status.text.includes("days ago") && (
                                        <button
                                            onClick={() => handleOpenUpdate(event.id)}
                                            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                                        >
                                            Update
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <InboxIcon className="h-14 w-14 text-gray-300 mb-4" />
                        <span className="text-lg font-medium text-gray-600">No events found</span>
                        <span className="text-sm text-gray-400 mt-1">
                            There are no events available at the moment.
                        </span>
                    </p>
                )}
            </div>


            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Event"
            >
                <Create
                    auth={auth}
                    sanctions={createData?.sanctions || []}
                    locations={createData?.locations || []}
                    school_structure={createData?.school_structure || {}}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refreshEvents();
                    }}
                />

            </Modal>

            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="Update Event"
            >
                <Update
                    event={updateData?.event}
                    sanctions={updateData?.sanctions || []}
                    locations={updateData?.locations || []}
                    school_structure={updateData?.school_structure || {}}
                    onSuccess={() => {
                        setShowUpdateModal(false);
                        refreshEvents();
                    }}
                />
            </Modal>

        </AppLayout>
    );
}
