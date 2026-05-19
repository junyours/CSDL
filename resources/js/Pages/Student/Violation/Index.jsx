import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { router } from "@inertiajs/react";
import { AlertTriangle, ArrowRight, Printer } from "lucide-react";
import ProfilePhotoWarning from "../../../Components/ProfilePhotoWarning";
import { Button, Card, Col, Grid, Row, Typography } from "antd";
import {
    PlusOutlined,
    TeamOutlined,
    FileTextOutlined,
    SaveFilled,
    SaveOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function Index({ auth, violations, filters }) {
    const user = auth?.user;
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!user?.profile_photo) {
            setImageError(true);
            return;
        }

        const img = new Image();

        const src = user.profile_photo.startsWith("profile-photos/")
            ? `/storage/${user.profile_photo}`
            : `https://lh3.googleusercontent.com/d/${user.profile_photo}`;

        img.src = src;

        img.onload = () => setImageError(false);
        img.onerror = () => setImageError(true);

    }, [user?.profile_photo]);

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

    const screens = useBreakpoint();
    const isMobile = !screens.md;



    return (
        <AppLayout user={user} breadcrumbs={["Violations"]}>

            {user?.profile_photo && !imageError ? (
                <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>
                    <Card
                        style={{
                            marginBottom: 16,
                            borderRadius: 12,
                        }}
                    >
                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col>
                                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                    Violation Records
                                </Title>
                                <Text type="secondary">
                                    For any concerns, please inquire to the Office of the CSDL
                                </Text>
                            </Col>

                            <Col>
                                <Button
                                    onClick={() => window.open("/student/violations/print",)}
                                    type="primary"
                                >
                                    Print Record
                                </Button>
                            </Col>
                        </Row>
                    </Card>

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

                <ProfilePhotoWarning
                    onAction={() => router.visit("/profile")}
                />

            )}
        </AppLayout>
    );
}
