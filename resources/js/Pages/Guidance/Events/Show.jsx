import AppLayout from "../../../Layouts/AppLayout";
import { Link } from "@inertiajs/react";
import { useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Typography,
    Space,
    Tag,
    Table,
    Tooltip,
    Badge,
    Button,
    Empty
} from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Show({ auth, event }) {
    const user = auth?.user;

    const formatTime = (time) => {
        if (!time) return "—";
        return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    const groupedAttendance = useMemo(() => {
        const groups = {};
        event.event_attendances.forEach((record) => {
            if (!groups[record.user_id_no]) {
                groups[record.user_id_no] = {
                    user_id_no: record.user_id_no,
                    times: {},
                    details: {}
                };
            }

            groups[record.user_id_no].times[record.checkpoint] = record.attended_at;

            groups[record.user_id_no].details[record.checkpoint] = {
                coords: record.location_coordinates,
                deviceId: record.device_user_id_no,
                model: record.device_model
            };
        });
        return Object.values(groups);
    }, [event.event_attendances]);

    const isDouble = event.attendance_type === "double";

    const renderTime = (time, details) => {
        if (!time) return <Text type="secondary">—</Text>;

        const googleMapsUrl = details?.coords
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.coords)}`
            : null;

        return (
            <Tooltip
                title={
                    <div style={{ minWidth: 200 }}>
                        <div><b>Device User:</b> {details?.deviceId || "N/A"}</div>
                        <div><b>Device Model:</b> {details?.model || "Unknown"}</div>
                        <div>
                            <b>Location:</b>{" "}
                            {googleMapsUrl ? (
                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                    View in map
                                </a>
                            ) : "No GPS"}
                        </div>
                    </div>
                }
            >
                <Text strong>{formatTime(time)}</Text>
            </Tooltip>
        );
    };

    const columns = [
        {
            title: "ID No.",
            dataIndex: "user_id_no",
            key: "user_id_no",
            render: (text) => <Text strong>{text}</Text>
        },
        ...(isDouble
            ? [
                {
                    title: "Time In",
                    render: (_, row) => renderTime(row.times.first_start_time, row.details.first_start_time),
                },
                {
                    title: "Time Out",
                    render: (_, row) => renderTime(row.times.first_end_time, row.details.first_end_time),
                },
                {
                    title: "Time In",
                    render: (_, row) => renderTime(row.times.second_start_time, row.details.second_start_time),
                },
                {
                    title: "Time Out",
                    render: (_, row) => renderTime(row.times.second_end_time, row.details.second_end_time),
                },
            ]
            : [
                {
                    title: "Time In",
                    render: (_, row) => renderTime(row.times.start_time, row.details.start_time),
                },
                {
                    title: "Time Out",
                    render: (_, row) => renderTime(row.times.end_time, row.details.end_time),
                },
            ]),
    ];

    return (
        <AppLayout user={user}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>

                {/* BACK */}
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="link"
                    href="/manage-event"
                    style={{ marginBottom: 16 }}
                >
                    Back to Events
                </Button>

                {/* HEADER */}
                <Card style={{ marginBottom: 24 }}>
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        <Space align="center">
                            <Title level={3} style={{ margin: 0 }}>
                                {event.event_name}
                            </Title>

                            {event.is_cancelled && (
                                <Tag color="red">Cancelled</Tag>
                            )}
                        </Space>

                        <Space wrap>
                            <Tag icon={<CalendarOutlined />} color="blue">
                                {formatDate(event.event_date)}
                            </Tag>

                            <Tag icon={<EnvironmentOutlined />} color="purple">
                                {event.location?.location_name || "No Venue"}
                            </Tag>
                        </Space>
                    </Space>
                </Card>

                <Row gutter={[24, 24]}>

                    {/* LEFT */}
                    <Col xs={24} lg={16}>
                        <Card title="Participants">

                            <Space direction="vertical" size={16} style={{ width: "100%" }}>

                                <div>
                                    <Text strong>Course</Text>
                                    <br />
                                    <Space wrap style={{ marginTop: 8 }}>
                                        {event.participant_courses.map(course => (
                                            <Tag key={course.id} color="blue">
                                                {course.course_name_abbreviation}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>

                                <div>
                                    <Text strong>Year Level</Text>
                                    <br />
                                    <Space wrap style={{ marginTop: 8 }}>
                                        {event.participant_year_levels.map(year => (
                                            <Tag key={year.id} color="green">
                                                {year.year_level_name}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>

                            </Space>

                        </Card>
                    </Col>

                    {/* RIGHT */}
                    <Col xs={24} lg={8}>
                        <Card
                            title="Sanction Policy"
                            extra={<ExclamationCircleOutlined />}
                        >
                            <Space direction="vertical">

                                <Text strong>{event.sanction?.sanction_name}</Text>

                                {event.sanction?.sanction_type === "monetary" ? (
                                    <Title level={4} style={{ margin: 0 }}>
                                        ₱{Number(event.sanction.monetary_amount).toLocaleString()}
                                    </Title>
                                ) : (
                                    <Tag color="blue">
                                        {event.sanction?.service_time} {event.sanction?.service_time_type}
                                    </Tag>
                                )}

                            </Space>
                        </Card>
                    </Col>

                </Row>

                {/* TABLE */}
                <Card
                    style={{ marginTop: 24 }}
                    title={
                        <Space>
                            <CheckCircleOutlined />
                            Attendance Log
                        </Space>
                    }
                    extra={
                        <Badge count={groupedAttendance.length} />
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={groupedAttendance}
                        rowKey="user_id_no"
                        pagination={{ pageSize: 10 }}
                        locale={{
                            emptyText: <Empty description="No attendance records found" />
                        }}
                    />
                </Card>

            </div>
        </AppLayout>
    );
}