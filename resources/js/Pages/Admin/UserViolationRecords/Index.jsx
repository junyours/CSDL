import DataTable from "../../../Components/DataTable";
import AppLayout from "../../../Layouts/AppLayout";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

import {
    Card,
    Col,
    Grid,
    Row,
    Typography,
    Statistic,
    List,
    Progress,
    Tag,
    Select,
    Space,
    Empty,
    Spin,
    Button,
    Modal
} from "antd";

import {
    AlertOutlined,
    PlusOutlined,
    RiseOutlined,
    UserDeleteOutlined
} from "@ant-design/icons";
import Create from "./Create";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

export default function Index({
    auth,
    violations,
    filters,
    topViolationCodesToday,
    totalViolationsToday,
    usersWithManyUnsettled,
    totalUnsettledRecords
}) {
    const user = auth?.user;
    const [violationsData, setViolationsData] = useState(violations);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        setViolationsData(violations);
    }, [violations]);

    const handleStatusChange = (row) => async (value) => {
        setUpdatingStatus(true);

        try {
            await axios.put(`/manage-violation-records/${row.id}/update-status`, {
                status: value,
            });

            toast.success("Status updated successfully!");

            router.reload({ only: ["violations", "totalUnsettledRecords"] });

        } catch (error) {
            toast.error("Failed to update status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSearch = (value) => {
        router.get(
            "/manage-violation-records",
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    const columns = [
        {
            key: "issued_date_time",
            label: "Issued Date & Time",
            render: (row) =>
                new Date(row.issued_date_time).toLocaleString("en-PH", {
                    year: "numeric",
                    month: "numeric",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
        },
        {
            key: "reference_no",
            label: "Reference No",
            render: (row) => row.reference_no,
        },
        {
            key: "user",
            label: "ID No",
            render: (row) => (
                <a
                    onClick={() =>
                        router.get(
                            `/manage-user/${row.user?.id}/show?user_id_no=${row.user?.user_id_no}`
                        )
                    }
                >
                    {row.user?.user_id_no}
                </a>
            ),
        },
        {
            key: "violation_codes",
            label: "Violation(s)",
            render: (row) => (
                <Space wrap>
                    {row.violation_codes?.map((code, i) => (
                        <Tag color="red" key={i}>
                            {code}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            key: "sanction",
            label: "Sanction",
            render: (row) => {
                const sanction = row.sanction;
                if (!sanction) return "—";

                return sanction.sanction_type === "monetary" ? (
                    <Tag color="green">
                        ₱ {Number(sanction.monetary_amount).toLocaleString()} - {sanction.sanction_name}
                    </Tag>
                ) : (
                    <Tag color="blue">
                        {sanction.service_time} {sanction.service_time_type} - {sanction.sanction_name}
                    </Tag>
                );
            },
        },
        {
            key: "issued_by",
            label: "Issued By",
            render: (row) => row.issuer?.user_id_no,
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <Select
                    value={row.status}
                    size="small"
                    style={{ width: 120 }}
                    onChange={handleStatusChange(row)}
                >
                    <Option value="unsettled">Unsettled</Option>
                    <Option value="settled">Settled</Option>
                    <Option value="void">Void</Option>
                </Select>
            ),
        },
    ];

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const [showCreate, setShowCreate] = useState(false);

    const handleSuccess = () => {
        setShowCreate(false);
        router.reload({ preserveScroll: true });
    };

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Violations Records"]}>
            <Spin spinning={updatingStatus} fullscreen tip="Updating status..." />

            <div
                style={{
                    padding: isMobile ? 12 : 24,
                    maxWidth: 1200,
                    margin: "0 auto",
                }}
            >
                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Violation Records Management
                            </Title>
                            <Text type="secondary">
                                View and manage all violation records
                            </Text>
                        </Col>

                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size={isMobile ? "middle" : "large"}
                                onClick={() => setShowCreate(true)}
                            >
                                Manual Input
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* ANALYTICS */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={8}>
                        <Card title={<Space><AlertOutlined />Violations Today</Space>} extra={today}>
                            <Statistic value={totalViolationsToday} />
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card title={"Total Unsettled Records"}>
                            <Statistic value={totalUnsettledRecords} />
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card title={<Space><UserDeleteOutlined />High Risk Users</Space>}>
                            {usersWithManyUnsettled?.length ? (
                                <List
                                    size="small"
                                    dataSource={usersWithManyUnsettled}
                                    renderItem={(item) => (
                                        <List.Item
                                            onClick={() =>
                                                window.open(
                                                    `/manage-user/${item.user_id}/show?user_id_no=${item.user_id_no}`,
                                                    "_blank"
                                                )
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                                <Text>{item.user_id_no}</Text>
                                                <Tag color="red">{item.total_unsettled}</Tag>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* TABLE */}
                <DataTable
                    columns={columns}
                    data={violationsData}
                    search={filters?.search}
                    onSearch={handleSearch}
                    searchPlaceholder="Search..."
                />
            </div>

            <Modal
                title="New Violation Record"
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