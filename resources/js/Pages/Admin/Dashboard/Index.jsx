import { useEffect, useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import StatsBarChart from '../../../Components/StatsBarChart';
import DashboardStats from '../../../Components/DashboardStats';
import DepartmentUsersPieChart from './components/DepartmentUsersPieChart';
import DepartmentViolationBarChart from './components/DepartmentViolationBarChart';

export default function Dashboard({
    auth,
    totalUsers,
    usersWithProfilePhoto,
    usersWithFaceEnrolled,
    unsettledViolations,
    violationChartData,
    departmentViolationChartData,
    departmentUserCounts,
    violationCodes
}) {



    const user = auth?.user;
    const colors = ["#2563eb", "#f97316", "#dc2626", "#10b981", "#efef04", "#8b5cf6"];

    return (
        <AppLayout user={user} breadcrumbs={["Dashboard"]}>
            <div className="container px-3 py-4 space-y-6">

                {/* CHART */}
                <div className="space-y-2">
                    <DepartmentUsersPieChart
                        data={departmentUserCounts}
                        usersWithProfilePhoto={usersWithProfilePhoto}
                        usersWithFaceEnrolled={usersWithFaceEnrolled}
                    />
                </div>

                <div className="space-y-2">
                    <DepartmentViolationBarChart
                        data={departmentViolationChartData}
                        violationCodes={violationCodes}
                    />

                </div>
            </div>
        </AppLayout>
    );
}