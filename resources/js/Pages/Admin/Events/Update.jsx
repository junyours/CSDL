import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ArchiveBoxXMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Update({ event, sanctions, locations, school_structure, onSuccess }) {
    const [form, setForm] = useState({
        event_name: "",
        location_id: "",
        sanction_id: "",
        school_year_id: "",
        participant_course_id: [],
        participant_year_level_id: [],
        event_date: "",
        attendance_type: "single",
        start_time: "",
        end_time: "",
        first_start_time: "",
        first_end_time: "",
        second_start_time: "",
        second_end_time: "",
        attendance_duration: "",
        is_cancelled: false,
        status: true,
    });

    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableYearLevels, setAvailableYearLevels] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!school_structure) return;

        setAvailableCourses(
            school_structure.departments?.flatMap(d => d.course) || []
        );
        setAvailableYearLevels(school_structure.year_levels || []);
    }, [school_structure]);

    useEffect(() => {
        if (!event) return;

        const formattedEvent = {
            ...event,
            start_time: event.start_time?.slice(0, 5) || "",
            end_time: event.end_time?.slice(0, 5) || "",
            first_start_time: event.first_start_time?.slice(0, 5) || "",
            first_end_time: event.first_end_time?.slice(0, 5) || "",
            second_start_time: event.second_start_time?.slice(0, 5) || "",
            second_end_time: event.second_end_time?.slice(0, 5) || "",
            participant_course_id: event.participant_course_id || [],
            participant_year_level_id: event.participant_year_level_id || [],
            is_cancelled: event.is_cancelled || false,
            status: event.status ?? true,
        };

        setForm(formattedEvent);
    }, [event]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            if (["participant_course_id", "participant_year_level_id"].includes(name)) {
                setForm(prev => {
                    const list = prev[name];
                    const id = Number(value);
                    return {
                        ...prev,
                        [name]: checked
                            ? [...list, id]
                            : list.filter(v => v !== id),
                    };
                });
            } else {
                setForm(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            ...form,
            location_id: Number(form.location_id),
            sanction_id: Number(form.sanction_id),
            school_year_id: Number(form.school_year_id),
            attendance_duration: Number(form.attendance_duration),
        };

        if (form.attendance_type === "single") {
            delete payload.first_start_time;
            delete payload.first_end_time;
            delete payload.second_start_time;
            delete payload.second_end_time;
        }

        if (form.attendance_type === "double") {
            delete payload.start_time;
            delete payload.end_time;
        }

        const promise = axios.put(`/event/${event.id}`, payload);

        toast.promise(promise, {
            loading: "Updating event...",
            success: "Event updated successfully!",
            error: "Failed to update event",
        });

        try {
            await promise;
            onSuccess?.();
        } catch (err) {
            if (err.response?.status === 422) {
                console.log(err.response.data.errors);
                toast.error("Validation failed. Check the console for details.");
            } else {
                toast.error("Failed to update event.");
            }
        } finally {
            setProcessing(false);
        }
    };

    const inputClass =
        "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Event Name
                </label>
                <input
                    type="text"
                    name="event_name"
                    value={form.event_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter event name"
                    required
                />
            </div>

            {/* Event Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Event Date
                </label>
                <input
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    className={inputClass}
                    required
                />
            </div>

            {/* Attendance Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attendance Type
                </label>
                <select
                    name="attendance_type"
                    value={form.attendance_type}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                </select>
            </div>

            {/* Time Fields */}
            {form.attendance_type === "single" && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Start Time
                        </label>
                        <input
                            type="time"
                            name="start_time"
                            value={form.start_time}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            End Time
                        </label>
                        <input
                            type="time"
                            name="end_time"
                            value={form.end_time}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                </div>
            )}

            {form.attendance_type === "double" && (
                <div className="grid grid-cols-2 gap-4">
                    {[
                        ["first_start_time", "First Start Time"],
                        ["first_end_time", "First End Time"],
                        ["second_start_time", "Second Start Time"],
                        ["second_end_time", "Second End Time"],
                    ].map(([name, label]) => (
                        <div key={name}>
                            <label className="block text-sm font-medium mb-1.5">{label}</label>
                            <input
                                type="time"
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attendance Duration (minutes)
                </label>
                <input
                    type="number"
                    name="attendance_duration"
                    value={form.attendance_duration}
                    onChange={handleChange}
                    className={inputClass}
                    required
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium mb-1.5">
                    Location
                </label>
                <select
                    name="location_id"
                    value={form.location_id}
                    onChange={handleChange}
                    className={inputClass}
                    required
                >
                    <option value="">Select Location</option>
                    {locations
                        .filter(l => l.status === 1)
                        .map(l => (
                            <option key={l.id} value={l.id}>
                                {l.location_name} — {l.address}
                            </option>
                        ))}
                </select>
            </div>

            {/* Sanction */}
            <div>
                <label className="block text-sm font-medium mb-1.5">
                    Sanction
                </label>
                <select
                    name="sanction_id"
                    value={form.sanction_id}
                    onChange={handleChange}
                    className={inputClass}
                    required
                >
                    <option value="">Select Sanction</option>
                    {sanctions
                        .filter(s => s.status === 1)
                        .map(s => (
                            <option key={s.id} value={s.id}>
                                {s.sanction_name}
                            </option>
                        ))}
                </select>
            </div>

            {/* School Year */}
            <div>
                <label className="block text-sm font-medium mb-1.5">
                    School Year
                </label>
                <select
                    name="school_year_id"
                    value={form.school_year_id}
                    onChange={handleChange}
                    className={inputClass}
                    required
                >
                    <option value="">Select School Year</option>
                    {school_structure?.school_years?.map(y => (
                        <option key={y.id} value={y.id}>
                            {y.semester.semester_name} {y.start_year}-{y.end_year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Courses */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Courses</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableCourses.map(c => {
                        const isSelected = form.participant_course_id.includes(c.id);
                        return (
                            <label
                                key={c.id}
                                className={`
                        flex items-center justify-center cursor-pointer
                        text-xs font-medium
                        rounded-lg border
                        transition-all duration-200
                        ${isSelected ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300"}
                        hover:bg-green-100
                        p-2
                        select-none
                    `}
                            >
                                <input
                                    type="checkbox"
                                    name="participant_course_id"
                                    value={c.id}
                                    checked={isSelected}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                {c.course_name_abbreviation}
                            </label>
                        );
                    })}
                </div>
            </div>


            {/* Year Levels */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Year Levels</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableYearLevels.map(y => {
                        const isSelected = form.participant_year_level_id.includes(y.id);
                        return (
                            <label
                                key={y.id}
                                className={`
                        flex items-center justify-center cursor-pointer
                        text-xs font-medium
                        rounded-lg border
                        transition-all duration-200
                        ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}
                        hover:bg-blue-100
                        p-2
                        select-none
                    `}
                            >
                                <input
                                    type="checkbox"
                                    name="participant_year_level_id"
                                    value={y.id}
                                    checked={isSelected}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                {y.year_level_name}
                            </label>
                        );
                    })}
                </div>
            </div>


            <div className="flex flex-col gap-2">
                {/* Cancel Event */}
                <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${form.is_cancelled ? "border-red-500" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                        <ArchiveBoxXMarkIcon className="h-5 w-5 text-red-600" />
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Cancel this event</label>
                            <p className="text-xs text-gray-500">This action can be undone later.</p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_cancelled"
                            checked={form.is_cancelled}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>

                {/* Move to Bin */}
                <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${!form.status ? "border-red-500" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                        <TrashIcon className="h-5 w-5 text-red-600" />
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Move to bin</label>
                            <p className="text-xs text-gray-500">This action cannot be undone.</p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!form.status}
                            onChange={() => setForm(prev => ({ ...prev, status: !prev.status }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>


            <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50"
            >
                {processing ? "Updating..." : "Update Event"}
            </button>
        </form>
    );
}