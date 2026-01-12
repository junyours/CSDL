import { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { PlusIcon } from "@heroicons/react/20/solid";

export default function Index({ auth, users, filters }) {
    const user = auth?.user;

    const columns = [
        {
            key: "user_id_no",
            label: "User ID No",
        },
        {
            key: "user_role",
            label: "Role",
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${row.user_role === "admin" ? "bg-red-100 text-red-700" :
                        row.user_role === "security" ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"}
                `}>
                    {row.user_role.toUpperCase()}
                </span>
            ),
        },
        {
            key: "face_enrolled",
            label: "Face Enrolled",
            render: (row) => (
                row.face_enrolled
                    ? <span className="text-green-600 font-medium">Yes</span>
                    : <span className="text-gray-400">No</span>
            ),
        },
        {
            key: "created_at",
            label: "Created At",
            render: (row) => (
                new Date(row.created_at).toLocaleDateString()
            ),
        },
    ];

    const handleSearch = (value) => {
        router.get(
            route("admin.users.index"),
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users"]}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-blue-100 mt-1">
                            Configure and manage all users.
                        </p>
                    </div>

                    <button
                        className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm md:text-base font-semibold shadow-md flex items-center gap-2 transition">
                        <PlusIcon className="h-5 w-5" />
                        Create New
                    </button>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={users}
                search={filters?.search}
                onSearch={handleSearch}
                searchPlaceholder="Search User ID or Role..."
            />

        </AppLayout>
    );
}
