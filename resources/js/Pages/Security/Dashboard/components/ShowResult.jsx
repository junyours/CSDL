import { Alert, Avatar, Card, Collapse, Divider, Drawer, Empty, Space, Spin, Tag, Typography, Form, Select, Input, Button, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserOutlined, SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export default function ShowResult({ open, onClose, searchValue, onTicketIssued }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const [violations, setViolations] = useState([]);
    const [loadingViolations, setLoadingViolations] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (!open || !searchValue) return;

        setLoading(true);

        axios
            .get("/security/get-user-details", {
                params: { user_id_no: [searchValue] }
            })
            .then((res) => {
                setData(res.data);
            })
            .catch(() => {
                setData([]);
            })
            .finally(() => setLoading(false));
    }, [open, searchValue]);

    const student = data?.[0];
    const enrollment = student?.current_enrollment;

    const fetchViolations = () => {
        setLoadingViolations(true);

        axios.get("/security/violations")
            .then(res => setViolations(res.data))
            .catch(() => setViolations([]))
            .finally(() => setLoadingViolations(false));
    };

    const handleSubmit = (values) => {
        setFormLoading(true);

        axios.post("/security/violation-store", {
            user_id_no: student.user_id_no,
            violations: values.violations,
        })
            .then(() => {
                message.success("Violation issued successfully");
                onTicketIssued?.();
                onClose();
            })
            .catch(() => {
                message.error("Failed to issue violation");
            })
            .finally(() => setFormLoading(false));
    };

    return (
        <Drawer
            placement="right"
            open={open}
            onClose={onClose}
            width="100%"
        >
            {loading ? (
                <Spin />
            ) : !student ? (
                <Empty description="No result found" />
            ) : !student.user_exists ? (
                <>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="User not registered in system" />
                    <Alert
                        type="error"
                        message="Note"
                        description="This user has no existing record in the system. Please verify the ID number or ask the student to register an account."
                        style={{ marginTop: 16 }}
                    />
                </>
            ) : !student.current_enrollment ? (
                <>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active enrollment" />
                    <Alert
                        type="warning"
                        message="Note"
                        description="This user has no active enrollment for the current school year. Please verify the ID number or ask the student to contact the registrar's office."
                        style={{ marginTop: 16 }}
                    />
                </>
            ) : (
                <>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Card size="small">
                            <div style={{ display: "flex", gap: 16 }}>

                                {/* Avatar */}
                                <Avatar
                                    size={50}
                                    src={
                                        student.avatar
                                            ? student.avatar.startsWith("profile-photos/")
                                                ? `/storage/${student.avatar}` // from your local storage
                                                : `https://lh3.googleusercontent.com/d/${student.avatar}` // from Google
                                            : <UserOutlined />
                                    }
                                    icon={!student.avatar && <UserOutlined />}

                                />

                                {/* Info */}
                                <div>
                                    <Space size={4} direction="vertical">
                                        <Title level={5} style={{ margin: 0, fontWeight: "bold" }}>
                                            {student.first_name} {student.last_name}
                                        </Title>
                                        <Text type="secondary">{student.user_id_no}</Text>
                                    </Space>


                                </div>


                            </div>
                        </Card>

                        <Card
                            size="small"
                            title={enrollment?.year_section?.course?.course_name_abbreviation}
                            extra={<CheckCircleOutlined style={{ color: "green" }} />}
                        >
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">
                                    {enrollment?.year_section?.year_level?.year_level_name} - Section {enrollment?.year_section?.section}
                                </Text>
                                <Text type="secondary">
                                    {enrollment?.year_section?.school_year?.start_year} -{" "}
                                    {enrollment?.year_section?.school_year?.end_year} (
                                    {enrollment?.year_section?.school_year?.semester?.semester_name} Semester)
                                </Text>
                            </Space>
                        </Card>

                        {student.has_violation_today ? (
                            <Alert
                                type="warning"
                                message="Already issued today"
                                description="This student already has a violation record today."
                                showIcon
                            />
                        ) : (
                            <Collapse
                                onChange={(key) => {
                                    if (key.includes("1") && violations.length === 0) {
                                        fetchViolations();
                                    }
                                }}
                            >
                                <Panel header={<Text strong>Issue Ticket</Text>} key="1">

                                    {loadingViolations ? (
                                        <Spin />
                                    ) : (
                                        <Form layout="vertical" onFinish={handleSubmit}>

                                            {/* Violations */}
                                            <Form.Item
                                                name="violations"
                                                rules={[{ required: true, message: "Please select at least one violation" }]}
                                            >
                                                <Select mode="multiple" placeholder="Select violations">
                                                    {violations.map(v => (
                                                        <Option key={v.id} value={v.id}>
                                                            {v.violation_code}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>

                                            {/* Submit */}
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                block
                                                loading={formLoading}
                                                style={{ marginTop: 10 }}
                                                disabled={student.has_violation_today}
                                            >
                                                Save
                                            </Button>

                                        </Form>
                                    )}

                                </Panel>
                            </Collapse>
                        )}
                    </Space>
                </>
            )
            }
        </Drawer >
    );
}