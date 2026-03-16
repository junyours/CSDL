import DataTable from "../../../Components/DataTable";
import AppLayout from "../../../Layouts/AppLayout";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { AlertCircle, TrendingUp, UserX, BarChart3, ExternalLink, ChevronRight } from "lucide-react";
import { ArrowTopRightOnSquareIcon, ChartBarIcon, ExclamationTriangleIcon, UserMinusIcon } from "@heroicons/react/24/outline";

export default function Index({
    auth,
    violations,
    filters,
    topViolationCodesToday,
    totalViolationsToday,
    usersWithManyUnsettled
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
                        year: "numeric", month: "numeric", day: "2-digit",
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
                        <span key={i} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md font-semibold border border-red-200">
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
                                {sanction.service_time} {sanction.service_time_type} - <span className="text-blue-700 font-semibold border border-blue-200 px-2 py-1 rounded-md"> {sanction.sanction_name} </span>
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
                    className={`px-2 py-1 text-xs uppercase rounded-md font-medium ${row.status === "settled" ? "bg-green-100 text-green-700" :
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
            <div className="py-4 px-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Violations Records Management</h1>
                    <p className="text-blue-100 mt-1">View and manage all violation records.</p>
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* TOTAL VIOLATIONS TODAY */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                                    Violations Today
                                </p>
                                <div className="bg-red-50 p-2.5 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                                {totalViolationsToday}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-500 mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live updates from today's records
                        </p>
                    </div>

                    {/* TOP PICKED VIOLATIONS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                                Top Violations
                            </p>
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                        </div>

                        <div className="space-y-3">
                            {topViolationCodesToday?.length > 0 ? (
                                topViolationCodesToday.map((item, index) => (
                                    <div key={index} className="relative overflow-hidden group">
                                        <div className="flex items-center justify-between relative z-10 px-3 py-2">
                                            <span className="font-bold text-slate-700 text-sm">
                                                {item.violation_code}
                                            </span>
                                            <span className="text-xs font-black bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                                                {item.total}
                                            </span>
                                        </div>
                                        {/* Progress Bar Background */}
                                        <div className="absolute inset-0 bg-slate-50 rounded-lg -z-0"></div>
                                        <div
                                            className="absolute inset-y-0 left-0 bg-red-100/50 rounded-lg -z-0 transition-all duration-500"
                                            style={{ width: `${(item.total / totalViolationsToday) * 100}%` }}
                                        ></div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No data available yet</p>
                            )}
                        </div>
                    </div>

                    {/* HIGH RISK USERS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                                High Risk Users
                            </p>
                            <UserX className="h-5 w-5 text-indigo-600" />
                        </div>

                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                            {usersWithManyUnsettled?.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-400">All clear. No high risk users.</p>
                                </div>
                            ) : (
                                usersWithManyUnsettled?.map((user, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const url = `/manage-user/${user.user_id}/show?user_id_no=${user.user_id_no}`;
                                            window.open(url, "_blank");
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                                    >
                                        <span className="font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                                            {user.user_id_no}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                                {user.total_unsettled}
                                            </span>
                                            <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-400" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
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
            </div>
        </AppLayout >
    );
}