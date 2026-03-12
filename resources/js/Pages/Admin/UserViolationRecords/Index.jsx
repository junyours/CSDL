import DataTable from "../../../Components/DataTable";
import AppLayout from "../../../Layouts/AppLayout";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { AlertCircle, TrendingUp, UserX, BarChart3, ExternalLink } from "lucide-react";
import { ArrowTopRightOnSquareIcon, ChartBarIcon, ExclamationTriangleIcon, UserMinusIcon } from "@heroicons/react/24/outline";

export default function Index({
    auth,
    violations,
    filters,
    topViolationCodesToday,
    topUserUnsettledAllTime // Renamed to match the new controller prop
}) {
    const user = auth?.user;
    const [violationsData, setViolationsData] = useState(violations);

    useEffect(() => {
        setViolationsData(violations);
    }, [violations]);

    const handleStatusChange = (row) => async (e) => {
        const newStatus = e.target.value;
        toast.promise(
            axios.put(`/manage-violation-records/${row.id}/update-status`, { status: newStatus }),
            {
                loading: "Updating status...",
                success: "Status updated successfully!",
                error: "Failed to update status.",
            }
        );

        setViolationsData((prev) => ({
            ...prev,
            data: prev.data.map((v) =>
                v.id === row.id ? { ...v, status: newStatus } : v
            ),
        }));
    };

    const handleSearch = (value) => {
        router.get(
            "/manage-violation-records",
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    const columns = [
        {
            key: "issued_date_time",
            label: "Issued Date & Time",
            render: (row) => (
                <span>
                    {new Date(row.issued_date_time).toLocaleString("en-PH", {
                        year: "numeric", month: "short", day: "2-digit",
                        hour: "2-digit", minute: "2-digit", hour12: true,
                    })}
                </span>
            ),
        },
        {
            key: "reference_no",
            label: "Reference No",
            render: (row) => <span>{row.reference_no}</span>,
        },
        {
            key: "user",
            label: "ID No",
            render: (row) => (
                <div
                    className="font-medium text-left cursor-pointer text-blue-600 hover:underline"
                    onClick={() => router.get(`/manage-user/${row.user?.id}/show?user_id_no=${row.user?.user_id_no}`)}
                >
                    {row.user?.user_id_no}
                </div>
            ),
        },
        {
            key: "violation_codes",
            label: "Violation(s)",
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    {row.violation_codes?.map((code, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            {code}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: "sanction",
            label: "Sanction",
            render: (row) => {
                const sanction = row.sanction;
                if (!sanction) return "—";
                return (
                    <span className="text-sm font-medium">
                        {sanction.sanction_type === "monetary" && (
                            <span className="text-xs px-2 py-1 rounded-full text-green-700">
                                ₱ {Number(sanction.monetary_amount).toLocaleString()} - {sanction.sanction_name}
                            </span>
                        )}
                        {sanction.sanction_type === "service" && (
                            <span className="text-xs px-2 py-1 rounded-full text-blue-700">
                                {sanction.service_time} {sanction.service_time_type} - {sanction.sanction_name}
                            </span>
                        )}
                    </span>
                );
            },
        },
        {
            key: "issued_by",
            label: "Issued By",
            render: (row) => <span>{row.issuer.user_id_no}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <select
                    value={row.status}
                    onChange={handleStatusChange(row)}
                    className={`px-2 py-1 text-xs uppercase rounded-full font-medium ${row.status === "settled" ? "bg-green-100 text-green-700" :
                        row.status === "void" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    <option value="unsettled">Unsettled</option>
                    <option value="settled">Settled</option>
                    <option value="void">Void</option>
                </select>
            ),
        }
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Violations Records"]}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Violations Records Management</h1>
                <p className="text-blue-100 mt-1">View and manage all violation records.</p>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Top Violations Today */}
                {topViolationCodesToday?.map((item, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all group"
                    >
                        {/* Decorative Background Icon */}
                        <ChartBarIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-gray-50 opacity-10 group-hover:scale-110 transition-transform" />

                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                    Trending Today #{index + 1}
                                </p>
                                <h2 className="text-3xl font-black text-gray-800 mt-1 tracking-tight">
                                    {item.violation_code}
                                </h2>
                            </div>
                            <div className="bg-red-50 p-2 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{item.total}</span>
                            <span className="text-sm text-gray-500 font-medium">Recorded Cases</span>
                        </div>

                        {/* Progress Bar Visual */}
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                ))}

                {/* Enhanced Top Unsettled Violator Card */}
                <div className="relative overflow-hidden bg-white border-2 border-indigo-50 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all group lg:col-span-1">
                    <UserMinusIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-50 opacity-20 group-hover:scale-110 transition-transform" />

                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                Critical Attention
                            </p>
                            <div
                                className="flex items-center gap-1 group/link mt-1 cursor-pointer"
                                onClick={() => {
                                    if (topUserUnsettledAllTime?.user_id) {
                                        const url = `/manage-user/${topUserUnsettledAllTime.user_id}/show?user_id_no=${topUserUnsettledAllTime.user_id_no}`;
                                        window.open(url, '_blank');
                                    }
                                }}
                            >
                                <h2 className="text-2xl font-black text-gray-800 group-hover/link:text-indigo-600 transition-colors">
                                    {topUserUnsettledAllTime?.user_id_no ?? "—"}
                                </h2>
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover/link:text-indigo-600 transition-colors" />
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-lg">
                            <div className="animate-pulse h-2 w-2 bg-indigo-600 rounded-full absolute -top-1 -right-1"></div>
                            <UserMinusIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 font-medium">
                        Owner of <span className="text-red-600 font-bold underline decoration-2">{topUserUnsettledAllTime?.total_unsettled ?? 0}</span> unsettled records
                    </p>

                    {/* Breakdown List - Modernized */}
                    {topUserUnsettledAllTime?.violations_breakdown && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 relative z-10">
                            <p className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-tighter">Frequency Breakdown</p>
                            <div className="grid grid-cols-1 gap-2">
                                {topUserUnsettledAllTime.violations_breakdown.slice(0, 3).map((v, i) => (
                                    <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <span className="text-xs font-bold text-gray-700">{v.code}</span>
                                        <span className="text-[10px] font-black bg-white border px-2 py-0.5 rounded shadow-sm text-gray-900">
                                            x{v.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={violationsData}
                search={filters?.search}
                onSearch={handleSearch}
                searchPlaceholder="Search reference number or ID number..."
                exportRoute="/manage-violation-records/export"
            />
        </AppLayout>
    );
}