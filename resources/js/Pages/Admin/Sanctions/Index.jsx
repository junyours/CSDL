import { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { PlusIcon } from "@heroicons/react/20/solid";
import Create from "./Create";
import Update from "./Update";
import Modal from "../../../Components/Modal";
import { CurrencyDollarIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { HandCoins, BrushCleaning } from "lucide-react";

export default function Index({ auth, sanctions, filters }) {
    const user = auth?.user;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSanction, setSelectedSanction] = useState(null);

    const columns = [
        {
            key: "sanction_type",
            label: "Type",
            render: (row) => {
                const type = row.sanction_type;

                if (type === "monetary") {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                            MONETARY
                        </span>
                    );
                }

                if (type === "service") {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            SERVICE
                        </span>
                    );
                }

                return "-";
            },
        },

        { key: "sanction_name", label: "Name" },
        { key: "sanction_description", label: "Description" },

        {
            key: "monetary_amount",
            label: "Amount",
            render: (row) =>
                row.sanction_type === "monetary" ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                        ₱{Number(row.monetary_amount).toLocaleString()}
                    </span>
                ) : (
                    "-"
                ),
        },

        {
            key: "service_time",
            label: "Service Time",
            render: (row) =>
                row.sanction_type === "service" ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                        {row.service_time} {row.service_time_type}
                    </span>
                ) : (
                    "-"
                ),
        },

    ];


    const handleSearch = (value) => {
        router.get(
            route("setup.sanction.index"),
            { search: value },
            { preserveState: true }
        );
    };

    const handleSuccess = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setSelectedSanction(null);

        // Auto refresh without full reload
        router.reload({ only: ["sanctions", "filters"] });
    };

    const handleEdit = (row) => {
        setSelectedSanction(row);
        setShowUpdateModal(true);
    };

    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Sanctions"]}>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Setup Sanctions</h1>
                        <p className="text-blue-100 mt-1">
                            Configure and manage all events in one place.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm md:text-base font-semibold shadow-md flex items-center gap-2 transition-all duration-200">
                        <PlusIcon className="h-5 w-5" />
                        Create New
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={sanctions}
                search={filters?.search || ""}
                onSearch={handleSearch}
                searchPlaceholder="Search sanctions..."
                actions={(row) => (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleEdit(row)}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Update
                        </button>
                    </div>
                )}
            />

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Sanction"
            >
                <Create auth={auth} onSuccess={handleSuccess} />
            </Modal>

            {/* Update Modal */}
            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="Update Sanction"
            >
                {selectedSanction && (
                    <Update
                        auth={auth}
                        sanction={selectedSanction}
                        onSuccess={handleSuccess}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}
