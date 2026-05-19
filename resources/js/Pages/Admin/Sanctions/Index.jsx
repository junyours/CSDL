import { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import { PlusIcon } from "@heroicons/react/20/solid";
import Create from "./Create";
import Update from "./Update";
import { CurrencyDollarIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { HandCoins, BrushCleaning } from "lucide-react";
import { Button, Card, Col, Grid, Row, Typography, Modal, Tag } from "antd";
import {
    PlusOutlined,
    SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
                        <Tag color={"gold"}>
                            MONETARY
                        </Tag>
                    );
                }

                if (type === "service") {
                    return (
                        <Tag color={"blue"}>
                            SERVICE
                        </Tag>
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
                    <Tag color={"gold"}>
                        ₱{Number(row.monetary_amount).toLocaleString()}
                    </Tag>
                ) : (
                    "-"
                ),
        },

        {
            key: "service_time",
            label: "Service Time",
            render: (row) =>
                row.sanction_type === "service" ? (
                    <Tag color={"blue"}>
                        {row.service_time} {row.service_time_type}
                    </Tag>
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

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Sanctions"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Sanction Setup
                            </Title>
                            <Text type="secondary">
                                Manage sanctions
                            </Text>
                        </Col>

                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size={isMobile ? "middle" : "large"}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create New
                            </Button>
                        </Col>
                    </Row>
                </Card>

                <DataTable
                    columns={columns}
                    data={sanctions}
                    search={filters?.search || ""}
                    onSearch={handleSearch}
                    searchPlaceholder="Search sanctions..."
                    actions={(row) => (
                        <div className="flex justify-end">
                            <Button
                                onClick={() => handleEdit(row)}
                            >
                                Update
                            </Button>
                        </div>
                    )}
                />
            </div>

            <Modal
                title="Create Sanction"
                open={showCreateModal}
                onCancel={() => setShowCreateModal(false)}
                footer={null}
                destroyOnClose
            >
                <Create
                    auth={auth}
                    onSuccess={() => {
                        handleSuccess();
                        setShowCreateModal(false);
                    }}
                />
            </Modal>

            {/* Update Modal */}
            <Modal
                title="Update Sanction"
                open={showUpdateModal}
                onCancel={() => setShowUpdateModal(false)}
                footer={null}
                destroyOnClose
            >
                {selectedSanction && (
                    <Update
                        auth={auth}
                        sanction={selectedSanction}
                        onSuccess={() => {
                            handleSuccess();
                            setShowUpdateModal(false);
                        }}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}
