import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
    Form,
    Input,
    Button,
    Row,
    Col,
    Select,
    Divider,
    Alert,
    Card,
    Avatar,
    Typography,
    Space,
    Spin,
    Empty,
    DatePicker,
} from "antd";

import {
    UserOutlined,
    SearchOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Create({ auth, onSuccess }) {
    const [form] = Form.useForm();

    const [processing, setProcessing] = useState(false);

    const [searchLoading, setSearchLoading] = useState(false);
    const [student, setStudent] = useState(null);

    const [violations, setViolations] = useState([]);
    const [loadingViolations, setLoadingViolations] = useState(false);

    useEffect(() => {
        fetchViolations();
    }, []);

    const fetchViolations = async () => {
        setLoadingViolations(true);

        try {
            const res = await axios.get("/security/violations");
            setViolations(res.data);
        } catch (error) {
            setViolations([]);
        } finally {
            setLoadingViolations(false);
        }
    };

    const handleSearchStudent = async () => {
        const userIdNo = form.getFieldValue("user_id_no");

        if (!userIdNo) {
            toast.error("Please enter User ID No");
            return;
        }

        setSearchLoading(true);
        setStudent(null);

        try {
            const res = await axios.get("/security/get-user-details", {
                params: {
                    user_id_no: [userIdNo],
                },
            });

            const data = res.data?.[0];

            if (!data) {
                toast.error("Student not found");
                return;
            }

            setStudent(data);

            toast.success("Student found");
        } catch (error) {
            setStudent(null);
            toast.error("User does not exist");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        if (!student) {
            toast.error("Please search student first");
            return;
        }

        setProcessing(true);

        try {
            await axios.post("/security/violation-store", {
                user_id_no: student.user_id_no,
                violations: values.violations,
                issued_date_time: values.issued_date_time
                    ? values.issued_date_time.format("YYYY-MM-DD HH:mm:ss")
                    : null,
                remarks: values.remarks,
            });

            toast.success("Violation record created successfully");

            form.resetFields();
            setStudent(null);

            onSuccess?.();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create violation record"
            );
        } finally {
            setProcessing(false);
        }
    };

    const enrollment = student?.current_enrollment;

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
        >
            {/* Search Student */}
            <Row gutter={12}>
                <Col xs={24} md={18}>
                    <Form.Item
                        label="User ID No"
                        name="user_id_no"
                        rules={[
                            {
                                required: true,
                                message: "Please enter User ID No",
                            },
                        ]}
                    >
                        <Input
                            placeholder="e.g. 2022-1-01234"
                            allowClear
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        loading={searchLoading}
                        onClick={handleSearchStudent}
                        block
                        style={{ marginTop: 30 }}
                    >
                        Search
                    </Button>
                </Col>
            </Row>

            {/* Student Details */}
            {searchLoading ? (
                <Spin />
            ) : student ? (
                <>
                    {!student.user_exists ? (
                        <>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="User not registered in system"
                            />

                            <Alert
                                type="error"
                                message="Note"
                                description="This user has no existing record in the system."
                                style={{ marginTop: 16 }}
                            />
                        </>
                    ) : !student.current_enrollment ? (
                        <>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No active enrollment"
                            />

                            <Alert
                                type="warning"
                                message="Note"
                                description="This student has no active enrollment."
                                style={{ marginTop: 16 }}
                            />
                        </>
                    ) : (
                        <>
                            <Divider />

                            {/* Student Info */}
                            <Card size="small">
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 16,
                                        alignItems: "center",
                                    }}
                                >
                                    <Avatar
                                        size={60}
                                        src={
                                            student.avatar
                                                ? student.avatar.startsWith(
                                                    "profile-photos/"
                                                )
                                                    ? `/storage/${student.avatar}`
                                                    : `https://lh3.googleusercontent.com/d/${student.avatar}`
                                                : null
                                        }
                                        icon={!student.avatar && <UserOutlined />}
                                    />

                                    <div>
                                        <Space
                                            direction="vertical"
                                            size={2}
                                        >
                                            <Title
                                                level={5}
                                                style={{ margin: 0 }}
                                            >
                                                {student.first_name}{" "}
                                                {student.last_name}
                                            </Title>

                                            <Text type="secondary">
                                                {student.user_id_no}
                                            </Text>
                                        </Space>
                                    </div>
                                </div>
                            </Card>

                            {/* Enrollment */}
                            <Card
                                size="small"
                                style={{ marginTop: 12 }}
                                title={
                                    enrollment?.year_section?.course
                                        ?.course_name_abbreviation
                                }
                                extra={
                                    <CheckCircleOutlined
                                        style={{ color: "green" }}
                                    />
                                }
                            >
                                <Space direction="vertical" size={4}>
                                    <Text type="secondary">
                                        {
                                            enrollment?.year_section?.year_level
                                                ?.year_level_name
                                        }{" "}
                                        - Section{" "}
                                        {enrollment?.year_section?.section}
                                    </Text>

                                    <Text type="secondary">
                                        {
                                            enrollment?.year_section?.school_year
                                                ?.start_year
                                        }{" "}
                                        -{" "}
                                        {
                                            enrollment?.year_section?.school_year
                                                ?.end_year
                                        }{" "}
                                        (
                                        {
                                            enrollment?.year_section?.school_year
                                                ?.semester?.semester_name
                                        }{" "}
                                        Semester)
                                    </Text>
                                </Space>
                            </Card>

                            {/* Existing Violation Warning */}
                            {student.has_violation_today && (
                                <Alert
                                    type="warning"
                                    message="Already issued today"
                                    description="This student already has a violation record today."
                                    showIcon
                                    style={{ marginTop: 16 }}
                                />
                            )}

                            <Divider />

                            {/* Violations */}
                            <Form.Item
                                label="Select Violations"
                                name="violations"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select at least one violation",
                                    },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    loading={loadingViolations}
                                    optionFilterProp="children"
                                    showSearch
                                >
                                    {violations.map((v) => (
                                        <Option
                                            key={v.id}
                                            value={v.id}
                                        >
                                            {v.violation_code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Issued Date & Time */}
                            <Form.Item
                                label="Issued Date & Time"
                                name="issued_date_time"
                                initialValue={dayjs()}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select issued date and time",
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD HH:mm:ss"
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf("day");
                                    }}
                                />
                            </Form.Item>

                            {/* Remarks */}
                            <Form.Item
                                label="Remarks"
                                name="remarks"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Enter remarks (optional)"
                                />
                            </Form.Item>
                        </>
                    )}
                </>
            ) : null}

            {/* Submit */}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                    disabled={
                        !student ||
                        !student.user_exists ||
                        !student.current_enrollment
                    }
                    style={{ marginTop: "15px" }}
                >
                    {processing ? "Saving..." : "Save"}
                </Button>
            </Form.Item>
        </Form>
    );
}