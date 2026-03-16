import Modal from '@/Components/Modal';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ArrowRight, ArrowRightIcon, User } from 'lucide-react';
import ViolationModal from './ViolationModal';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StudentResultModal({
    open,
    onClose,
    id,
    student,
    loading,
    error,
}) {

    const [showViolationModal, setShowViolationModal] = useState(false);
    const [violations, setViolations] = useState([]);
    const [loadingViolations, setLoadingViolations] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const openViolationModal = async () => {
        onClose();
        setShowViolationModal(true);

        if (violations.length === 0) {
            setLoadingViolations(true);
            try {
                const res = await axios.get('/security/violations');
                setViolations(res.data);
            } catch (error) {
                console.error('Failed to load violations', error);
            } finally {
                setLoadingViolations(false);
            }
        }
    };


    const handleSubmit = async (selectedViolationIds) => {
        if (!student) return;

        setSubmitting(true);

        try {
            const res = await axios.post('/security/violation-store', {
                user_id_no: student.user_id_no,
                violations: selectedViolationIds,
            });

            // Toast (if using react-hot-toast)
            toast.success("Violation ticket issued successfully!");

            // Close violation modal
            setShowViolationModal(false);

            // Save receipt data
            setReceiptData(res.data.record);

            // Open receipt modal
            setShowReceiptModal(true);

        } catch (error) {
            console.error('Failed to store violation record:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const currentEnrollment = student?.enrolled_students?.find(
        (e) => e.year_section?.school_year?.is_current === 1
    );

    return (
        <>
            <Modal isOpen={open} onClose={onClose} title={
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                        ID Number
                    </span>
                    <span className="font-mono text-base">
                        {id}
                    </span>
                </div>
            }>
                <div className="space-y-4">

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
                            <p className="mt-4 text-sm text-gray-600">
                                Fetching user details…
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 shrink-0" />
                            <div>
                                <p className="font-medium text-red-700">
                                    Unable to find user
                                </p>
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {!loading && student && (
                        <>

                            <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        <div
                                            className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden
                       flex items-center justify-center
                       ring-2 ring-blue-500 ring-offset-4 ring-offset-white"
                                        >
                                            {student.avatar ? (
                                                <img
                                                    src={
                                                        student.avatar.startsWith("profile-photos/")
                                                            ? `/storage/${student.avatar}`
                                                            : `https://lh3.googleusercontent.com/d/${student.avatar}`
                                                    }
                                                    alt="Student Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-10 w-10 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Text block */}
                                    <div className="flex flex-col leading-tight">
                                        {/* Last name (big) */}
                                        <div className="text-xl font-semibold text-gray-900">
                                            {student.last_name}
                                        </div>

                                        {/* First + middle name */}
                                        <div className="text-sm text-gray-600">
                                            {student.first_name} {student.middle_name}
                                        </div>

                                        {/* ID number */}
                                        <div className="text-xs text-gray-500 font-mono">
                                            {student.user_id_no}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current Enrollment */}
                            {currentEnrollment && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        {/* Department */}
                                        <div>
                                            <p className="text-gray-500">Department</p>
                                            <p className="font-medium text-gray-900">
                                                {currentEnrollment.year_section.course.department.department_name}
                                            </p>
                                        </div>

                                        {/* Course */}
                                        <div>
                                            <p className="text-gray-500">Course</p>
                                            <p className="font-medium text-gray-900">
                                                {currentEnrollment.year_section.course.course_name_abbreviation}
                                            </p>
                                        </div>

                                        {/* Year & Section */}
                                        <div>
                                            <p className="text-gray-500">Year & Section</p>
                                            <p className="font-medium text-gray-900">
                                                {currentEnrollment.year_section.year_level.year_level}
                                                {' – '}
                                                {currentEnrollment.year_section.section}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            )}


                            {!currentEnrollment && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                                    Not enrolled in the current semester.
                                </div>
                            )}

                            <div className="shrink-0 px-4 py-3 border-t bg-white">
                                {student.user_exists ? (
                                    <button
                                        onClick={openViolationModal}
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-3 rounded-lg transition"
                                    >
                                        Issue Violation Ticket
                                        <ArrowRightIcon className="inline-block ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-gray-300 text-gray-600 font-medium px-4 py-3 rounded-lg cursor-not-allowed"
                                    >
                                        Cannot issue ticket, user doesn't exist
                                    </button>
                                )}
                            </div>

                        </>
                    )}
                </div>
            </Modal>

            <ViolationModal
                open={showViolationModal}
                onClose={() => !submitting && setShowViolationModal(false)}
                onSubmit={handleSubmit}
                student={student}
                currentEnrollment={currentEnrollment}
                violations={violations}
                loading={loadingViolations}
                submitting={submitting}
            />

            <Modal
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                title=""
            >
                {receiptData && (
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-xs border overflow-hidden text-sm">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5">
                            <h2 className="text-lg font-semibold tracking-wide">
                                Violation Receipt
                            </h2>
                            <p className="text-xs opacity-80 mt-1">
                                Official Record Confirmation
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-5">

                            {/* Reference + Status */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500">Reference No</p>
                                    <p className="font-semibold text-gray-800">
                                        #{receiptData.reference_no}
                                    </p>
                                </div>

                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 uppercase font-medium">
                                    {receiptData.status}
                                </span>
                            </div>

                            <div className="border-t border-dashed"></div>

                            {/* User Info */}
                            <div>
                                <p className="text-xs text-gray-500">User ID No</p>
                                <p className="font-medium text-gray-800">
                                    {receiptData.user?.user_id_no}
                                </p>

                                <p className="text-xs text-gray-500 mt-3">Issued Date</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(receiptData.issued_date_time).toLocaleString()}
                                </p>
                            </div>

                            <div className="border-t border-dashed"></div>

                            {/* Violations */}
                            <div>
                                <p className="font-semibold text-gray-800 mb-3">
                                    Violations
                                </p>

                                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                                    {receiptData.violation_codes.map((code, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center bg-white rounded-sm px-3 py-2 shadow-sm"
                                        >
                                            <span className="text-gray-700 font-medium">
                                                {code}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t pt-4 text-center text-xs text-gray-400">
                                This document serves as an official violation record.
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="w-full bg-violet-600 hover:bg-violet-700 transition text-white py-2.5 rounded-xl font-medium shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </>

    );
}
