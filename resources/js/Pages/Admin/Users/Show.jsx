import React, { useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    Row,
    Col,
    Card,
    Avatar,
    Typography,
    Tag,
    Button,
    Space,
    Input,
    Descriptions,
    Empty,
    message,
    Grid,
    Divider,
    Spin,
    Tooltip,
    Modal,
    Table,
    Timeline,
} from "antd";

import {
    ArrowLeftOutlined,
    UserOutlined,
    SearchOutlined,
    RedoOutlined,
    MailOutlined,
    HomeOutlined,
    IdcardOutlined,
    CalendarOutlined,
    SafetyCertificateOutlined,
    CopyOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    ArrowsAltOutlined,
    PhoneOutlined,
} from "@ant-design/icons";

import { router } from "@inertiajs/react";
import axios from "axios";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

export default function Show({ auth, studentData }) {
    const user = auth?.user;
    const info = Array.isArray(studentData) ? studentData[0] : studentData;
    const enrollment = info?.current_enrollment;

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [loadingReset, setLoadingReset] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState(null);

    if (!info) {
        return (
            <AppLayout user={user}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No user data found" />
                </div>
            </AppLayout>
        );
    }

    /* ---------------- HELPERS ---------------- */
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getAvatar = () => {
        if (!info.avatar) return null;

        return info.avatar.startsWith("profile-photos/")
            ? `/storage/${info.avatar}`
            : `https://lh3.googleusercontent.com/d/${info.avatar}`;
    };

    const showResetConfirm = () => {
        confirm({
            title: "Reset Password",
            icon: <ExclamationCircleOutlined />,
            content: "This will generate a new password for the user.",
            okText: "Confirm",
            okType: "danger",
            cancelText: "Cancel",
            centered: true,
            onOk: handleResetPassword,
        });
    };

    const handleResetPassword = async () => {
        setLoadingReset(true);

        try {
            const res = await axios.post(`/manage/user/reset-password`, {
                user_id_no: info.user_id_no,
            });

            setGeneratedPassword(res.data.new_password);

            Modal.success({
                title: "New Password Generated",
                content: (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Card>
                            <Text strong>{res.data.new_password}</Text>
                        </Card>

                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                                navigator.clipboard.writeText(res.data.new_password);
                                message.success("Copied to clipboard");
                            }}
                        >
                            Copy Password
                        </Button>
                    </Space>
                ),
                centered: true,
            });

            message.success("Password reset successful");
        } catch (err) {
            message.error("Reset failed");
        } finally {
            setLoadingReset(false);
        }
    };

    const [search, setSearch] = useState(info.user_id_no);

    const handleSearch = (value) => {
        router.get(
            "/manage-violation-records",
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    const violationData = (info?.violation_records || []).map((record) => ({
        key: record.id,
        reference_no: record.reference_no,
        violations: record.violations,
    }));

    const violationColumns = [
        {
            title: "Reference No",
            dataIndex: "reference_no",
            key: "reference_no",
        },
        {
            title: "Violations",
            dataIndex: "violations",
            key: "violations",
            render: (violations) => (
                <Space wrap>
                    {violations?.length ? (
                        violations.map((v) => (
                            <Tag color="red" key={v.id}>
                                {v.violation_code}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary">No violations</Text>
                    )}
                </Space>
            ),
        },
    ];

    const timelineItems = (info?.violation_records || []).map((record) => ({
        key: record.id,
        children: (
            <Card
                size="small"
                style={{ borderRadius: 10 }}
                bodyStyle={{ padding: 12 }}
            >
                <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    {/* Header */}
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                        <Text strong>
                            {record.issued_date_time
                                ? new Date(record.issued_date_time).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                                : "N/A"}
                        </Text>
                        <Tag type="secondary"
                            color={
                                record.status === "unsettled"
                                    ? "gold"
                                    : record.status === "void"
                                        ? "default"
                                        : record.status === "settled"
                                            ? "green"
                                            : "blue"
                            }
                            style={{ fontSize: 12, textTransform: "uppercase" }}>
                            {record.status}
                        </Tag>
                    </Space>

                    {/* Violations */}
                    <Space wrap>
                        {record.violations?.length ? (
                            record.violations.map((v) => (
                                <Tag color="red" key={v.id}>
                                    {v.violation_code}
                                </Tag>
                            ))
                        ) : (
                            <Text type="secondary">No violations</Text>
                        )}
                    </Space>
                </Space>
            </Card>
        ),
    }));

    const items = [
        {
            key: "email",
            icon: <MailOutlined />,
            value: info.email_address,
        },
        {
            key: "birthday",
            icon: <CalendarOutlined />,
            value: info.birthday,
            render: (v) => `Born on ${formatDate(v)}`,
        },
        {
            key: "gender",
            icon: <IdcardOutlined />,
            value: info.gender,
        },
        {
            key: "address",
            icon: <HomeOutlined />,
            value: info.present_address,
            render: (v) => `Lives in ${v}`,
        },
        {
            key: "contact",
            icon: <PhoneOutlined />,
            value: info.contact_number,
            render: (v) => `${v}`,
        },
        {
            key: "created",
            icon: <ClockCircleOutlined />,
            value: info.created_at,
            render: (v) => `Joined ${formatDate(v)}`,
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users", info.user_id_no]}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? 12 : 24 }}>

                {info?.created_at ? (
                    <>
                        {/* PROFILE HEADER */}
                        <Card style={{ marginBottom: 16 }}>
                            <Space size="large" align="center">
                                <Avatar
                                    size={80}
                                    src={getAvatar()}
                                    icon={<UserOutlined />}
                                />

                                <div>
                                    <Row align="middle" gutter={32}>
                                        <Col>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>First name</Text>
                                                <br />
                                                <Title level={4} strong>{info.first_name}</Title>
                                            </div>
                                        </Col>
                                        {info.middle_name != 0 && (
                                            <Col>
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: "12px" }}>Middle name</Text>
                                                    <br />
                                                    <Title level={4} strong>{info.middle_name}</Title>
                                                </div>
                                            </Col>
                                        )}
                                        <Col>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>Last name</Text>
                                                <br />
                                                <Title level={4} strong>{info.last_name}</Title>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Tag color={"blue"}>
                                        {info.user_id_no}
                                    </Tag>
                                </div>
                            </Space>
                        </Card>

                        <Row gutter={[16, 16]}>
                            {/* LEFT PANEL */}
                            <Col xs={24} lg={8}>
                                <Card title="Personal Information">
                                    <Descriptions
                                        column={1}
                                        size="small"
                                        colon={false}
                                        labelStyle={{ width: 30 }}
                                    >
                                        {items
                                            .filter((item) => item.value)
                                            .map((item) => (
                                                <Descriptions.Item
                                                    key={item.key}
                                                    label={<Space>{item.icon}</Space>}
                                                >
                                                    {item.render ? item.render(item.value) : item.value}
                                                </Descriptions.Item>
                                            ))}
                                    </Descriptions>
                                </Card>

                                <Card
                                    className="mt-4"
                                    title={
                                        enrollment ? (
                                            <Space>
                                                <Tag color="default">
                                                    {enrollment?.year_section?.school_year?.semester?.semester_name} Semester
                                                </Tag>

                                                <Tag color="green">
                                                    A.Y.{" "}
                                                    {enrollment?.year_section?.school_year?.start_year} -{" "}
                                                    {enrollment?.year_section?.school_year?.end_year}
                                                </Tag>
                                            </Space>
                                        ) : (
                                            "Not enrolled in this semester"
                                        )
                                    }
                                >
                                    {enrollment ? (
                                        <>
                                            {/* HIGHLIGHT STATS */}
                                            <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                                                <Col xs={24} sm={12}>
                                                    <Text type="secondary">Course</Text>
                                                    <br />
                                                    <Text level={5} style={{ margin: 0 }}>
                                                        {enrollment?.year_section?.course?.course_name_abbreviation || "N/A"}
                                                    </Text>
                                                </Col>

                                                <Col xs={24} sm={12}>
                                                    <Text type="secondary">Department</Text>
                                                    <br />
                                                    <Text level={5} style={{ margin: 0 }}>
                                                        {
                                                            enrollment?.year_section?.course?.department
                                                                ?.department_name || "N/A"
                                                        }
                                                    </Text>
                                                </Col>
                                            </Row>

                                            <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                                                <Col xs={24} sm={12}>
                                                    <Text type="secondary">Year and Section</Text>
                                                    <br />
                                                    <Text level={5} style={{ margin: 0 }}>
                                                        {enrollment?.year_section?.year_level?.year_level} -{" "}
                                                        {enrollment?.year_section?.section}
                                                    </Text>
                                                </Col>
                                            </Row>


                                        </>
                                    ) : (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active enrollment" />
                                    )}
                                </Card>

                                {/* <Card className="mt-4 bg-red-100 dark:bg-red-900/30">
                                    <Space
                                        align="center"
                                        style={{ width: "100%", justifyContent: "space-between", }}
                                    >
                                        <Space>
                                            <div>
                                                <Title level={5} style={{ margin: 0 }}>
                                                    Account Security
                                                </Title>
                                                <Text type="secondary">
                                                    Reset this account’s password
                                                </Text>
                                            </div>
                                        </Space>

                                        <Tooltip title="Generate new password">
                                            <Button
                                                danger
                                                type="primary"
                                                icon={<RedoOutlined />}
                                                loading={loadingReset}
                                                onClick={showResetConfirm}
                                            >
                                                Reset
                                            </Button>
                                        </Tooltip>
                                    </Space>
                                </Card> */}
                            </Col>


                            {/* RIGHT PANEL */}
                            <Col xs={24} lg={16}>
                                {/* ENROLLMENT */}

                                <Card
                                    title="Violation Records"
                                    extra={
                                        <Button type="link" onClick={() => handleSearch(search)}>
                                            View <ArrowsAltOutlined />
                                        </Button>
                                    }
                                >
                                    {timelineItems.length > 0 ? (
                                        <Timeline
                                            mode="left"
                                            items={timelineItems}
                                        />
                                    ) : (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No unsettled violation records" />
                                    )}
                                </Card>

                                <Card
                                    title="Campus Clubs"
                                    className="mt-4"
                                >
                                    {info?.clubs?.length > 0 ? (
                                        <Space
                                            direction="vertical"
                                            style={{ width: "100%" }}
                                            size="middle"
                                        >
                                            {info.clubs.map((item) => (
                                                <Card
                                                    key={item.id}
                                                    size="small"
                                                    bodyStyle={{ padding: 12 }}
                                                    style={{
                                                        borderRadius: 12,
                                                    }}
                                                >
                                                    <Space align="center">
                                                        <Avatar
                                                            size={48}
                                                            src={
                                                                item.club?.club_logo_path
                                                                    ? `https://lh3.googleusercontent.com/d/${item.club?.club_logo_path}`
                                                                    : null
                                                            }
                                                            icon={<SafetyCertificateOutlined />}
                                                        />

                                                        <div>
                                                            <Text strong>
                                                                {item.club?.club_name}
                                                            </Text>

                                                            <br />

                                                            <Space wrap size={4}>
                                                                <Tag color="blue" style={{ textTransform: "uppercase" }}>
                                                                    {item.position}
                                                                </Tag>

                                                                {item.is_admin && (
                                                                    <Tag color="gold">
                                                                        Admin
                                                                    </Tag>
                                                                )}

                                                                <Tag
                                                                    color={
                                                                        item.club?.status === "Activated"
                                                                            ? "green"
                                                                            : "default"
                                                                    }
                                                                >
                                                                    {item.club?.status}
                                                                </Tag>
                                                            </Space>
                                                        </div>
                                                    </Space>
                                                </Card>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No joined clubs"
                                        />
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <Empty description="User does not yet registered in the system" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}