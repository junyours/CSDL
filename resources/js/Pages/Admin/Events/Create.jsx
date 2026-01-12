import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Create({
    auth,
    sanctions,
    locations,
    school_structure,
    onSuccess,
}) {
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
    });

    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableYearLevels, setAvailableYearLevels] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!school_structure?.school_years?.length) return;

        // Set availableCourses and availableYearLevels as before
        setAvailableCourses(
            school_structure.departments?.flatMap(d => d.course) || []
        );
        setAvailableYearLevels(school_structure.year_levels || []);

        // Auto-select the last School Year
        const lastSchoolYear = school_structure.school_years.slice(-1)[0];
        setForm(prev => ({
            ...prev,
            school_year_id: lastSchoolYear.id
        }));
    }, [school_structure]);



    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
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

        const promise = axios.post("/event/store", payload);

        toast.promise(promise, {
            loading: "Creating event...",
            success: "Event created successfully!",
            error: "Failed to create event",
        });

        try {
            await promise;
            onSuccess?.();
            setForm({
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
            });
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
                            <label className="block text-sm font-medium mb-1.5">
                                {label}
                            </label>
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
                            {y.start_year}-{y.end_year} {y.semester.semester_name} (Semester)
                        </option>
                    ))}
                </select>
            </div>


            {/* Courses */}
            <div className="mb-4">
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


            {/* Submit */}
            <button
                type="submit"
                disabled={processing}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
            >
                {processing ? "Saving..." : "Create Event"}
            </button>
        </form>
    );
}