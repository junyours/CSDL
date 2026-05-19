import AppLayout from "../../../Layouts/AppLayout";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";
import Create from "./Create";
import Update from "./Update";

import {
    Button,
    Card,
    Col,
    Row,
    Modal,
    Typography,
    Tag,
    Space,
    Input,
    Grid,
    Divider,
    Empty,
} from "antd";

import {
    PlusOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const formatTime = (time) => {
    if (!time) return null;
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

const getEventStatus = (eventDateStr) => {
    const today = new Date();
    const eventDate = new Date(eventDateStr);

    // Normalize time
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Special cases
    if (diffDays === 0) return { text: "Today", color: "green" };
    if (diffDays === 1) return { text: "Tomorrow", color: "blue" };
    if (diffDays === -1) return { text: "Yesterday", color: "red" };

    const absDays = Math.abs(diffDays);

    let value, unit;

    if (absDays >= 365) {
        value = Math.floor(absDays / 365);
        unit = "year";
    } else if (absDays >= 30) {
        value = Math.floor(absDays / 30);
        unit = "month";
    } else if (absDays >= 7) {
        value = Math.floor(absDays / 7);
        unit = "week";
    } else {
        value = absDays;
        unit = "day";
    }

    // pluralize
    const label = `${value} ${unit}${value > 1 ? "s" : ""}`;

    if (diffDays > 1) {
        return { text: `${label} to go`, color: "blue" };
    } else {
        return { text: `${label} ago`, color: "default" };
    }
};

export default function Index({ auth, events, filters }) {
    const user = auth?.user;

    const eventList = Array.isArray(events)
        ? events
        : events?.data || [];

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState(null);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateData, setUpdateData] = useState(null);

    const [search, setSearch] = useState(filters.search || "");

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const refreshEvents = () =>
        router.reload({ only: ["events"] });

    const handleOpenCreate = async () => {
        setLoadingCreate(true);
        try {
            await toast.promise(
                axios.get("/guidance/event/create").then((res) => {
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

    const handleOpenUpdate = async (id) => {
        await toast.promise(
            axios.get(`/guidance/event/${id}/edit`).then((res) => {
                setUpdateData(res.data);
                setShowUpdateModal(true);
            }),
            {
                loading: "Loading form...",
                success: "Form ready",
                error: "Failed to load form",
            }
        );
    };

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            window.location.pathname,
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    const handleManageClick = (id) => {
        router.get(`/guidance/manage-event/${id}/show`);
    };

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Events"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle" gutter={[12, 12]}>
                        <Col xs={24} md={12}>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Manage Events
                            </Title>
                            <Text type="secondary">
                                Configure and manage events
                            </Text>
                        </Col>

                        <Col xs={24} md={12} style={{ textAlign: isMobile ? "left" : "right" }}>
                            <Space wrap>
                                <Input.Search
                                    placeholder="Search events..."
                                    allowClear
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onSearch={handleSearch}
                                    style={{ width: 220 }}
                                />

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleOpenCreate}
                                    loading={loadingCreate}
                                >
                                    Create New
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* EVENTS */}
                {eventList.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {eventList.map((event) => {
                            const status = getEventStatus(event.event_date);
                            const canUpdate =
                                status.text !== "Yesterday" &&
                                !status.text.includes("ago");

                            return (
                                <Col xs={24} sm={12} lg={8} key={event.id}>
                                    <Card
                                        hoverable
                                        actions={[
                                            <span onClick={() => handleManageClick(event.id)}>View</span>,
                                            canUpdate && (
                                                <span onClick={() => handleOpenUpdate(event.id)}>Update</span>
                                            ),
                                        ]}
                                    >
                                        <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {event.event_name}
                                            </Text>

                                            <Space wrap>
                                                {status.text && (
                                                    <Tag color={status.color}>{status.text}</Tag>
                                                )}
                                                {Boolean(Number(event.is_cancelled)) && (
                                                    <Tag color="red">Cancelled</Tag>
                                                )}
                                            </Space>
                                        </Space>

                                        <Divider />

                                        <Space>
                                            <CalendarOutlined />
                                            <Text>
                                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </Text>
                                        </Space>

                                        <div style={{ marginTop: 8 }}>
                                            <Space wrap>
                                                <ClockCircleOutlined />
                                                {event.attendance_type === "single" ? (
                                                    <>
                                                        <Tag>{formatTime(event.start_time)}</Tag>
                                                        <Tag>{formatTime(event.end_time)}</Tag>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tag>{formatTime(event.first_start_time)}</Tag>
                                                        <Tag>{formatTime(event.first_end_time)}</Tag>
                                                        <Tag>{formatTime(event.second_start_time)}</Tag>
                                                        <Tag>{formatTime(event.second_end_time)}</Tag>
                                                    </>
                                                )}
                                            </Space>
                                        </div>

                                        <div style={{ marginTop: 10 }}>
                                            <Space>
                                                <EnvironmentOutlined />
                                                <Text>
                                                    {event.location?.location_name || "No location"}
                                                </Text>
                                            </Space>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <Card>
                        <Empty description="No events found" />
                    </Card>
                )}
            </div>

            {/* CREATE */}
            <Modal open={showCreateModal} onCancel={() => setShowCreateModal(false)} footer={null} title="Create Event">
                <Create
                    sanctions={createData?.sanctions || []}
                    locations={createData?.locations || []}
                    school_structure={createData?.school_structure || {}}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refreshEvents();
                    }}
                />
            </Modal>

            {/* UPDATE */}
            <Modal open={showUpdateModal} onCancel={() => setShowUpdateModal(false)} footer={null} title="Update Event">
                <Update
                    event={updateData?.event}
                    sanctions={updateData?.sanctions || []}
                    locations={updateData?.locations || []}
                    school_structure={updateData?.school_structure || {}}
                    onSuccess={() => {
                        setShowUpdateModal(false);
                        refreshEvents();
                    }}
                />
            </Modal>
        </AppLayout>
    );
}