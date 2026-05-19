import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    InputNumber,
    Button,
    Row,
    Col,
    Divider,
    Switch,
    Card,
    Space,
    Typography,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export default function Update({
    event,
    sanctions,
    locations,
    school_structure,
    onSuccess
}) {
    const [form] = Form.useForm();
    const [attendanceType, setAttendanceType] = useState("single");
    const [processing, setProcessing] = useState(false);

    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableYearLevels, setAvailableYearLevels] = useState([]);

    useEffect(() => {
        if (!school_structure) return;

        setAvailableCourses(
            school_structure.departments?.flatMap(d => d.course) || []
        );

        setAvailableYearLevels(
            school_structure.year_levels || []
        );
    }, [school_structure]);

    useEffect(() => {
        if (!event) return;

        form.setFieldsValue({
            ...event,
            event_date: dayjs(event.event_date),

            start_time: event.start_time ? dayjs(event.start_time, "HH:mm:ss") : null,
            end_time: event.end_time ? dayjs(event.end_time, "HH:mm:ss") : null,

            first_start_time: event.first_start_time ? dayjs(event.first_start_time, "HH:mm:ss") : null,
            first_end_time: event.first_end_time ? dayjs(event.first_end_time, "HH:mm:ss") : null,
            second_start_time: event.second_start_time ? dayjs(event.second_start_time, "HH:mm:ss") : null,
            second_end_time: event.second_end_time ? dayjs(event.second_end_time, "HH:mm:ss") : null,

            participant_course_id: event.participant_course_id || [],
            participant_year_level_id: event.participant_year_level_id || [],

            is_cancelled: event.is_cancelled || false,
            status: event.status ?? true,
        });

        setAttendanceType(event.attendance_type || "single");
    }, [event]);

    const handleSubmit = async (values) => {
        setProcessing(true);

        const payload = {
            ...values,
            event_date: values.event_date.format("YYYY-MM-DD"),

            // ⚠ FIXED FORMAT (IMPORTANT)
            start_time: values.start_time?.format("HH:mm"),
            end_time: values.end_time?.format("HH:mm"),
            first_start_time: values.first_start_time?.format("HH:mm"),
            first_end_time: values.first_end_time?.format("HH:mm"),
            second_start_time: values.second_start_time?.format("HH:mm"),
            second_end_time: values.second_end_time?.format("HH:mm"),

            location_id: Number(values.location_id),
            sanction_id: Number(values.sanction_id),
            school_year_id: Number(values.school_year_id),
            attendance_duration: Number(values.attendance_duration),
        };

        if (values.attendance_type === "single") {
            delete payload.first_start_time;
            delete payload.first_end_time;
            delete payload.second_start_time;
            delete payload.second_end_time;
        }

        if (values.attendance_type === "double") {
            delete payload.start_time;
            delete payload.end_time;
        }

        const promise = axios.put(`/event/${event.id}`, payload);

        toast.promise(promise, {
            loading: "Updating event...",
            success: "Event updated successfully!",
            error: "Failed to update event",
        });

        try {
            await promise;
            onSuccess?.();
        } catch (err) {
            if (err.response?.status === 422) {
                console.log("Validation Errors:", err.response.data.errors);
                toast.error("Validation failed. Check console.");
            } else {
                toast.error("Update failed.");
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
        >
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="event_name"
                        label="Event Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        name="event_date"
                        label="Event Date"
                        rules={[{ required: true }]}
                    >
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        name="attendance_type"
                        label="Attendance Type"
                        rules={[{ required: true }]}
                    >
                        <Select onChange={setAttendanceType}>
                            <Select.Option value="single">Single</Select.Option>
                            <Select.Option value="double">Double</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            {/* TIME */}
            {attendanceType === "single" && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="start_time" label="Time In" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="end_time" label="Time Out" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            )}

            {attendanceType === "double" && (
                <Row gutter={16}>
                    {[
                        ["first_start_time", "First Time In"],
                        ["first_end_time", "First Time Out"],
                        ["second_start_time", "Second Time In"],
                        ["second_end_time", "Second Time Out"],
                    ].map(([name, label]) => (
                        <Col span={12} key={name}>
                            <Form.Item name={name} label={label} rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
            )}

            <Form.Item
                name="attendance_duration"
                label="Duration (minutes)"
                rules={[{ required: true }]}
            >
                <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Divider />

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="location_id" label="Location" rules={[{ required: true }]}>
                        <Select>
                            {locations?.filter(l => l.status === 1).map(l => (
                                <Select.Option key={l.id} value={l.id}>
                                    {l.location_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="sanction_id" label="Sanction" rules={[{ required: true }]}>
                        <Select>
                            {sanctions?.filter(s => s.status === 1).map(s => (
                                <Select.Option key={s.id} value={s.id}>
                                    {s.sanction_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="school_year_id" label="School Year" rules={[{ required: true }]}>
                <Select>
                    {school_structure?.school_years?.map(y => (
                        <Select.Option key={y.id} value={y.id}>
                            {y.start_year}-{y.end_year} ({y.semester.semester_name})
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Divider />

            <Form.Item
                name="participant_course_id"
                label="Courses"
                rules={[{ required: true }]}
            >
                <Select mode="multiple">
                    {availableCourses.map(c => (
                        <Select.Option key={c.id} value={c.id}>
                            {c.course_name_abbreviation}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="participant_year_level_id"
                label="Year Levels"
                rules={[{ required: true }]}
            >
                <Select mode="multiple">
                    {availableYearLevels.map(y => (
                        <Select.Option key={y.id} value={y.id}>
                            {y.year_level_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Divider />

            {/* TOGGLES */}
            <Card size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Form.Item
                        name="is_cancelled"
                        label="Cancel Event"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Active Status"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Text type="secondary">
                        Turning off "Active" will move this event to bin.
                    </Text>
                </Space>
            </Card>

            <Button
                type="primary"
                htmlType="submit"
                loading={processing}
                block
            >
                Update Event
            </Button>
        </Form>
    );
}