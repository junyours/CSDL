import AppLayout from "../../../Layouts/AppLayout";
import { PlusIcon, UserIcon } from "@heroicons/react/20/solid";
import DataTable from "@/Components/DataTable"; // Ensure this path is correct
import { useState } from "react";
import Modal from "../../../Components/Modal";
import Create from "./Create";
import { router } from "@inertiajs/react";
import axios from "axios";

export default function Index({ auth, users, filters }) {
    const user = auth?.user;
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Student Modal States
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState(null);

    // 1. Updated Navigation Function
    const handleManageClick = (id, userIdNo) => {
        // Navigates to the Show page via Inertia
        // We pass the primary ID in the URL and the student ID as a query param
        router.get(`/manage-user/${id}/show`, {
            user_id_no: [userIdNo]
        });
    };

    const handleSuccess = () => {
        setShowCreateModal(false);
        router.reload({ preserveScroll: true });
    };

    const handleSearch = (search) => {
        router.get("/manage-user", { search }, { preserveState: true });
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin": return "bg-red-500";
            case "security": return "bg-green-500";
            case "student": return "bg-blue-500";
            case "moderator": return "bg-purple-500";
            default: return "bg-gray-400";
        }
    };

    const columns = [
        {
            key: "avatar",
            label: "User",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{row.user_id_no}</span>
                </div>
            ),
        },
        {
            key: "user_role",
            label: "Role",
            render: (row) => (
                <span className={`px-3 py-1 rounded-md text-white text-[10px] uppercase font-bold ${getRoleBadgeColor(row.user_role)}`}>
                    {row.user_role}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Date Registered",
            render: (row) => new Date(row.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hh: "2-digit",
                mm: "2-digit",
            }),
        }
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users"]}>
            <div className="py-4 px-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                            <p className="text-blue-100 mt-1">Configure and manage all users.</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2 transition"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create New
                        </button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={users}
                    search={filters.search}
                    onSearch={handleSearch}
                    searchPlaceholder="Search by ID or Role..."
                    actions={(row) => (
                        row.user_role?.toLowerCase() === "student" && (
                            <button
                                onClick={() => handleManageClick(row.id, row.user_id_no)}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Manage
                            </button>
                        )
                    )}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User">
                <Create auth={auth} onSuccess={handleSuccess} />
            </Modal>
        </AppLayout>
    );
}