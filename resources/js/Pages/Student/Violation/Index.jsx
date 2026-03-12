import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { router } from "@inertiajs/react";
import { AlertTriangle, ArrowRight, Printer } from "lucide-react";

export default function Index({ auth, violations, filters }) {
    const user = auth?.user;

    const handleSearch = (value) => {
        router.get(
            route("student.violations.index"),
            { search: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const columns = [
        {
            key: "reference_no",
            label: "Reference #",
            render: (row) => row.reference_no,
        },
        {
            key: "issued_date_time",
            label: "Issued Date & Time",
            render: (row) => {
                const date = new Date(row.issued_date_time);

                return date.toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
            },
        },
        {
            key: "violation_codes",
            label: "Violation(s)",
            render: (row) =>
                row.violation_codes?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {row.violation_codes.map((code, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700 border border-red-200"
                            >
                                {code}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">-</span>
                ),
        },
        {
            key: "sanction",
            label: "Sanction",
            render: (row) => {
                const sanction = row.sanction;

                if (!sanction) return <span className="text-gray-400">-</span>;

                if (sanction.sanction_type === "monetary") {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 border border-green-200">
                            {sanction.sanction_name} - ₱ {Number(sanction.monetary_amount).toLocaleString()}
                        </span>
                    );
                }

                if (sanction.sanction_type === "service") {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                            {sanction.sanction_name} - {sanction.service_time} {sanction.service_time_type}
                        </span>
                    );
                }

                return sanction.sanction_name;
            },
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span
                    className={`px-2 py-1 text-xs rounded-lg uppercase font-medium
                        ${row.status === "settled"
                            ? "bg-green-100 text-green-700"
                            : row.status === "unsettled"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            key: "issuer",
            label: "Issued By",
            render: (row) => row.issuer?.user_id_no || "-",
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Violations"]}>
            {user?.profile_photo ? (
                <div className="pb-20">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Violation Records</h1>
                                <p className="text-blue-100 mt-1">
                                    For any concerns, please contact the Office of the CSDL.
                                </p>
                            </div>
                            <button
                                onClick={() => window.open("/student/violations/print", "_blank")}
                                className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm md:text-base font-semibold shadow-md flex items-center gap-2 transition-all duration-200"
                            >
                                <Printer className="h-5 w-5" />
                                Print Record
                            </button>

                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={violations}
                        search={filters?.search}
                        onSearch={handleSearch}
                        searchPlaceholder="Search violations..."
                        total={violations.total}
                    />
                </div>
            ) : (

                <div className="max-w-2xl mx-auto bg-white border border-yellow-200 shadow-sm rounded-xl p-8">

                    {/* ICON */}
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7 text-yellow-600" />
                        </div>
                    </div>

                    {/* TITLE */}
                    <h2 className="text-xl font-semibold text-gray-800 text-center">
                        Profile Photo Required
                    </h2>

                    <p className="text-sm text-gray-600 mt-2 text-center">
                        To access your violation records,
                        please upload a proper profile photo following the instructions below.
                    </p>

                    {/* STEPS */}
                    <div className="mt-6 space-y-4 text-sm text-gray-700">

                        <div>
                            <ul className="list-disc list-inside mt-2 text-gray-600">
                                <li>Plain white or light background</li>
                                <li>Face clearly visible</li>
                                <li>No filters or heavy editing</li>
                                <li>No sunglasses, caps, or obstructions</li>
                            </ul>
                        </div>

                    </div>

                    {/* IMAGE REFERENCE */}
                    <div className="mt-8">
                        <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
                            Reference Example
                        </p>

                        <div className="flex justify-center">
                            <img
                                src="/assets/images/proper-profile-photo.jpg"
                                alt="Proper Profile Photo Example"
                                className="w-40 h-40 object-cover border border-gray-400 shadow"
                            />
                        </div>
                    </div>

                    {/* WARNING NOTE */}
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">
                            Important Notice:
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                            <span>Failure to follow the profile photo guidelines may result in </span>
                            <span className="font-semibold">automatic account deactivation</span>.
                        </p>
                    </div>

                    {/* BUTTON */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.visit('/profile')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Go to Profile <ArrowRight className="w-4 h-4 inline-block ml-1" />
                        </button>
                    </div>

                </div>

            )}
        </AppLayout>
    );
}
