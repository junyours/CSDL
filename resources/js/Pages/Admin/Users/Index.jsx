import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "@/Components/DataTable";
import { useState } from "react";
import Create from "./Create";
import { router } from "@inertiajs/react";

import {
    Button,
    Card,
    Col,
    Grid,
    Modal,
    Row,
    Tag,
    Typography
} from "antd";

import { useTheme } from "../../../ThemeContext";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Index({ auth, users, filters }) {
    const user = auth?.user;

    const [showCreate, setShowCreate] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const handleSuccess = () => {
        setShowCreate(false);
        router.reload({ preserveScroll: true });
    };

    const handleSearch = (search) => {
        router.get("/manage-user", { search }, { preserveState: true });
    };

    const handleManageClick = (id, userIdNo) => {
        router.get(`/manage-user/${id}/show`, {
            user_id_no: [userIdNo]
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin": return "red";
            case "security": return "gold";
            case "student": return "blue";
            case "guidance_counselor": return "green";
            default: return "bg-gray-400";
        }
    };

    const columns = [
        {
            key: "user_id_no",
            label: "User ID",
            render: (row) => (
                <Text>
                    {row.user_id_no}
                </Text>
            ),
        },
        {
            key: "user_role",
            label: "Role",
            render: (row) => (
                <Tag
                    color={getRoleBadgeColor(row.user_role)}
                    style={{ textTransform: "uppercase" }}
                >
                    {row.user_role.replace(/_/g, " ")}
                </Tag>
            ),
        },
        {
            key: "created_at",
            label: "Date Registered",
            render: (row) =>
                new Date(row.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }),
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Manage Users
                            </Title>
                            <Text type="secondary">
                                Configure and manage users
                            </Text>
                        </Col>

                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size={isMobile ? "middle" : "large"}
                                onClick={() => setShowCreate(true)}
                            >
                                Create User
                            </Button>
                        </Col>
                    </Row>
                </Card>

                <DataTable
                    columns={columns}
                    data={users}
                    search={filters.search}
                    onSearch={handleSearch}
                    searchPlaceholder="Search ID or Role..."
                    actions={(row) =>
                        row.user_role?.toLowerCase() === "student" && (
                            <Button
                                onClick={() => handleManageClick(row.id, row.user_id_no)}
                            >
                                Manage
                            </Button>
                        )
                    }
                />

            </div>

            <Modal
                title="Create User"
                open={showCreate}
                onCancel={() => setShowCreate(false)}
                footer={null}
                destroyOnClose
            >
                <Create
                    auth={auth}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </AppLayout>
    );
}