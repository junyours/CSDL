import { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../../Layouts/AppLayout";
import DataTable from "../../../Components/DataTable";
import Create from "./Create";
import Update from "./Update";

import {
    Button,
    Card,
    Col,
    Grid,
    Row,
    Typography,
    Select,
    Space,
    Alert,
    Spin,
    message,
    Modal
} from "antd";

import {
    PlusOutlined,
    SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

export default function Index({
    auth,
    violations,
    filters,
    sanctions,
    defaultSanction,
}) {
    const user = auth?.user;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);

    const [selectedDefault, setSelectedDefault] = useState(
        defaultSanction?.id || null
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const columns = [
        { key: "violation_code", label: "Code" },
        { key: "violation_description", label: "Description" },
    ];

    const handleSearch = (value) => {
        router.get(
            window.route("setup.violation.index"),
            { search: value },
            { preserveState: true }
        );
    };

    const handleSuccess = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setSelectedViolation(null);

        router.reload({ only: ["violations", "filters"] });
    };

    const handleEdit = (row) => {
        setSelectedViolation(row);
        setShowUpdateModal(true);
    };

    const handleDefaultChange = (value) => {
        setSelectedDefault(value);
        setIsUpdating(true);

        router.patch(`/sanctions/${value}/set-default`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                message.success("Default sanction updated!");
            },
            onError: () => {
                message.error("Failed to update.");
                setSelectedDefault(defaultSanction?.id || null);
            },
            onFinish: () => setIsUpdating(false),
        });
    };

    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Violations"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{
                    marginBottom: 16,
                    borderRadius: 12,
                }}>
                    <Row justify="space-between" align="middle" gutter={[8, 8]}>
                        <Col>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Violation Setup
                            </Title>
                            <Text type="secondary">
                                Manage violations and default sanction
                            </Text>
                        </Col>

                        <Col>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                type="primary"
                                icon={<PlusOutlined />}
                                size={isMobile ? "middle" : "large"}
                            >
                                Create New
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* MAIN LAYOUT */}
                <Row gutter={[16, 16]}>

                    {/* LEFT: DEFAULT SANCTION */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: "sticky", top: 24 }}>
                            <Card
                                title={
                                    <Space>
                                        <SettingOutlined />
                                        Default Sanction
                                    </Space>
                                }
                                bordered={false}
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size="middle">

                                    <Text type="secondary">
                                        Automatically applied to new violations
                                    </Text>

                                    <Select
                                        placeholder="Select sanction"
                                        value={selectedDefault}
                                        onChange={handleDefaultChange}
                                        loading={isUpdating}
                                        disabled={isUpdating}
                                        style={{ width: "100%" }}
                                        size="large"
                                    >
                                        {sanctions.map((s) => (
                                            <Option key={s.id} value={s.id}>
                                                {s.sanction_name}
                                            </Option>
                                        ))}
                                    </Select>

                                    <Alert
                                        type="info"
                                        showIcon
                                        message="Auto-applied"
                                        description="This sanction will be pre-selected when issuing violations."
                                    />

                                    {isUpdating && (
                                        <div style={{ textAlign: "center" }}>
                                            <Spin size="small" />
                                            <div style={{ fontSize: 12, marginTop: 4 }}>
                                                Updating...
                                            </div>
                                        </div>
                                    )}
                                </Space>
                            </Card>
                        </div>
                    </Col>

                    {/* RIGHT: TABLE */}
                    <Col xs={24} lg={16}>
                        <DataTable
                            columns={columns}
                            data={violations}
                            search={filters?.search || ""}
                            onSearch={handleSearch}
                            searchPlaceholder="Search violations..."
                            actions={(row) => (
                                <Button
                                    onClick={() => handleEdit(row)}
                                >
                                    Update
                                </Button>
                            )}
                        />
                    </Col>
                </Row>

            </div>

            <Modal
                title="Create Violation"
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

            {/* UPDATE MODAL */}
            <Modal
                title="Update Violation"
                open={showUpdateModal}
                onCancel={() => setShowUpdateModal(false)}
                footer={null}
                destroyOnClose
            >
                {selectedViolation && (
                    <Update
                        auth={auth}
                        violation={selectedViolation}
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