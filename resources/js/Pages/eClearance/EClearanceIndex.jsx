import React, { useMemo, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import toast from "react-hot-toast";
import axios from 'axios';

import {
    Button,
    Card,
    Col,
    Row,
    Modal,
    Typography,
    Space,
    Input,
    Grid,
    Empty,
    Segmented,
    List,
    Tag,
    Dropdown,
    Avatar,
} from "antd";

import {
    PlusOutlined,
    FolderFilled,
    AppstoreOutlined,
    BarsOutlined,
    MoreOutlined,
    EyeOutlined,
    EditOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    CalendarOutlined,
} from "@ant-design/icons";

import { router } from '@inertiajs/react';
import EClearanceCreate from './EClearanceCreate';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function EClearanceIndex({ auth, eClearance }) {

    const user = auth?.user;

    const eClearanceList = Array.isArray(eClearance)
        ? eClearance
        : eClearance?.data || [];

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState(null);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const refreshEClearance = () =>
        router.reload({ only: ["eClearance"] });

    const handleOpenCreate = async () => {
        setLoadingCreate(true);

        try {
            await toast.promise(
                axios.get("/create/e-clearance").then((res) => {
                    setCreateData(res.data);
                    setShowCreateModal(true);
                }),
                {
                    loading: "Preparing form...",
                    success: "Form ready!",
                    error: "Failed to prepare form",
                }
            );
        } finally {
            setLoadingCreate(false);
        }
    };

    const filteredEClearance = useMemo(() => {
        return eClearanceList.filter((item) => {

            const schoolYear =
                `A.Y. ${item.school_year?.start_year}-${item.school_year?.end_year}`
                    .toLowerCase();

            const semester =
                item.school_year?.semester?.semester_name?.toLowerCase() || "";

            return (
                schoolYear.includes(search.toLowerCase()) ||
                semester.includes(search.toLowerCase())
            );
        });
    }, [eClearanceList, search]);

    const renderStatusTag = (isActive) => {
        return isActive ? (
            <Tag
                icon={<CheckCircleFilled />}
                color="success"
                style={{ borderRadius: 999 }}
            >
                Active
            </Tag>
        ) : (
            <Tag
                icon={<CloseCircleFilled />}
                color="default"
                style={{ borderRadius: 999 }}
            >
                Inactive
            </Tag>
        );
    };

    return (
        <AppLayout
            user={user}
            breadcrumbs={["Manage", "e-Clearance"]}
        >
            <div
                style={{
                    padding: isMobile ? 12 : 24,
                    maxWidth: 1400,
                    margin: "0 auto",
                }}
            >

                {/* HEADER */}
                <Card
                    style={{
                        marginBottom: 20,
                        borderRadius: 20,
                    }}
                    bodyStyle={{
                        padding: isMobile ? 16 : 24,
                    }}
                >
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col xs={24} lg={12}>
                            <Space direction="vertical" size={2}>
                                <Title
                                    level={isMobile ? 4 : 2}
                                    style={{ margin: 0 }}
                                >
                                    e-Clearance Drive
                                </Title>

                                <Text type="secondary">
                                    Manage semestral clearance folders and configurations
                                </Text>
                            </Space>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Space
                                wrap
                                style={{
                                    width: "100%",
                                    justifyContent: isMobile
                                        ? "flex-start"
                                        : "flex-end",
                                }}
                            >
                                <Input.Search
                                    placeholder="Search clearance folders..."
                                    allowClear
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: isMobile ? "100%" : 280,
                                    }}
                                />

                                <Segmented
                                    value={viewMode}
                                    onChange={setViewMode}
                                    options={[
                                        {
                                            value: "grid",
                                            icon: <AppstoreOutlined />,
                                        },
                                        {
                                            value: "list",
                                            icon: <BarsOutlined />,
                                        },
                                    ]}
                                />

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleOpenCreate}
                                    loading={loadingCreate}
                                    size="middle"
                                >
                                    Create
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* EMPTY */}
                {filteredEClearance.length === 0 && (
                    <Card
                        style={{
                            borderRadius: 20,
                        }}
                    >
                        <Empty
                            description="No e-clearance folders found"
                        />
                    </Card>
                )}

                {/* GRID VIEW */}
                {viewMode === "grid" && filteredEClearance.length > 0 && (
                    <Row gutter={[20, 20]}>
                        {filteredEClearance.map((item) => {

                            const menuItems = [
                                {
                                    key: "view",
                                    icon: <EyeOutlined />,
                                    label: (
                                        <span
                                            onClick={() =>
                                                router.visit(`/e-clearance/${item.id}`)
                                            }
                                        >
                                            View
                                        </span>
                                    ),
                                },
                                {
                                    key: "update",
                                    icon: <EditOutlined />,
                                    label: "Update",
                                },
                            ];

                            return (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    xl={6}
                                    key={item.id}
                                >
                                    <Card
                                        hoverable
                                        style={{
                                            borderRadius: 20,
                                            height: "100%",
                                            transition: "0.2s",
                                        }}
                                        bodyStyle={{
                                            padding: 18,
                                        }}
                                    >
                                        <Space
                                            direction="vertical"
                                            size={14}
                                            style={{ width: "100%" }}
                                        >

                                            {/* TOP */}
                                            <Row
                                                justify="space-between"
                                                align="top"
                                            >
                                                <Avatar
                                                    size={56}
                                                    shape="square"
                                                    style={{
                                                        background: "#1677ff",
                                                        borderRadius: 16,
                                                    }}
                                                    icon={
                                                        <FolderFilled
                                                            style={{
                                                                fontSize: 28,
                                                                color: "#fff",
                                                            }}
                                                        />
                                                    }
                                                />

                                                <Dropdown
                                                    menu={{
                                                        items: menuItems,
                                                    }}
                                                    trigger={["click"]}
                                                >
                                                    <Button
                                                        type="text"
                                                        icon={<MoreOutlined />}
                                                    />
                                                </Dropdown>
                                            </Row>

                                            {/* CONTENT */}
                                            <Space
                                                direction="vertical"
                                                size={4}
                                            >
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    A.Y. {item.school_year?.start_year}-
                                                    {item.school_year?.end_year}
                                                </Text>

                                                <Text type="secondary">
                                                    {item.school_year?.semester?.semester_name} Semester
                                                </Text>
                                            </Space>

                                            {/* FOOTER */}
                                            <Row
                                                justify="space-between"
                                                align="middle"
                                            >
                                                {renderStatusTag(item.is_active)}
                                            </Row>
                                        </Space>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* LIST VIEW */}
                {viewMode === "list" && filteredEClearance.length > 0 && (
                    <Card
                        style={{
                            borderRadius: 20,
                        }}
                        bodyStyle={{
                            padding: 0,
                        }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={filteredEClearance}
                            renderItem={(item) => {

                                const menuItems = [
                                    {
                                        key: "view",
                                        icon: <EyeOutlined />,
                                        label: (
                                            <span
                                                onClick={() =>
                                                    router.visit(`/e-clearance/${item.id}`)
                                                }
                                            >
                                                View
                                            </span>
                                        ),
                                    },
                                    {
                                        key: "update",
                                        icon: <EditOutlined />,
                                        label: "Update",
                                    },
                                ];

                                return (
                                    <List.Item
                                        style={{
                                            padding: "18px 24px",
                                        }}
                                        actions={[
                                            renderStatusTag(item.is_active),

                                            <Dropdown
                                                key="dropdown"
                                                menu={{
                                                    items: menuItems,
                                                }}
                                                trigger={["click"]}
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<MoreOutlined />}
                                                />
                                            </Dropdown>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size={50}
                                                    shape="square"
                                                    style={{
                                                        background: "#1677ff",
                                                        borderRadius: 14,
                                                    }}
                                                    icon={
                                                        <FolderFilled
                                                            style={{
                                                                fontSize: 24,
                                                                color: "#fff",
                                                            }}
                                                        />
                                                    }
                                                />
                                            }
                                            title={
                                                <Text strong>
                                                    A.Y. {item.school_year?.start_year}-
                                                    {item.school_year?.end_year}
                                                </Text>
                                            }
                                            description={
                                                <Space
                                                    direction="vertical"
                                                    size={0}
                                                >
                                                    <Text type="secondary">
                                                        {item.school_year?.semester?.semester_name} Semester
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </Card>
                )}
            </div>

            {/* CREATE MODAL */}
            <Modal
                open={showCreateModal}
                onCancel={() => setShowCreateModal(false)}
                footer={null}
                title="New e-Clearance"
                destroyOnClose
                width={350}
            >
                <EClearanceCreate
                    school_structure={createData?.school_structure || {}}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refreshEClearance();
                    }}
                />
            </Modal>
        </AppLayout>
    );
}