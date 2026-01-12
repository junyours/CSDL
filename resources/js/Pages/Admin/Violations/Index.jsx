import { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { PlusIcon } from "@heroicons/react/20/solid";
import Create from "./Create";
import Update from "./Update"; // New import
import Modal from "../../../Components/Modal";

export default function Index({ auth, violations, filters }) {
    const user = auth?.user;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);

    const columns = [
        { key: "violation_code", label: "Code" },
        { key: "violation_description", label: "Description" },
    ];

    const handleSearch = (value) => {
        router.get(window.route("setup.violation.index"), { search: value }, { preserveState: true });
    };

    const handleSuccess = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setSelectedViolation(null);
        router.reload({ only: ['violations', 'filters'] });
    };

    const handleEdit = (row) => {
        setSelectedViolation(row);
        setShowUpdateModal(true);
    };

    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Violations"]}>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Setup Violations</h1>
                        <p className="text-blue-100 mt-1">
                            Configure and manage all violation types and rules.
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
                data={violations}
                search={filters?.search || ""}
                onSearch={handleSearch}
                searchPlaceholder="Search violations..."
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
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Violation">
                <Create auth={auth} onSuccess={handleSuccess} />
            </Modal>
            {/* Update Modal */}
            <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Violation">
                {selectedViolation && (
                    <Update auth={auth} violation={selectedViolation} onSuccess={handleSuccess} />
                )}
            </Modal>
        </AppLayout>
    );
}