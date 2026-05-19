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
} from "antd";
import dayjs from "dayjs";

export default function Create({
    sanctions,
    locations,
    school_structure,
    onSuccess,
}) {
    const [form] = Form.useForm();
    const [attendanceType, setAttendanceType] = useState("single");
    const [processing, setProcessing] = useState(false);

    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableYearLevels, setAvailableYearLevels] = useState([]);

    useEffect(() => {
        if (!school_structure?.school_years?.length) return;

        setAvailableCourses(
            school_structure.departments?.flatMap(d => d.course) || []
        );

        setAvailableYearLevels(
            school_structure.year_levels || []
        );

        const last = school_structure.school_years.slice(-1)[0];

        form.setFieldsValue({
            school_year_id: last.id,
            attendance_type: "single",
        });

        setAttendanceType("single");
    }, [school_structure]);

    const handleSubmit = async (values) => {
        setProcessing(true);

        const payload = {
            ...values,
            event_date: values.event_date.format("YYYY-MM-DD"),

            // Convert times
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

        // preserve your original logic
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

        const promise = axios.post("/guidance/event/store", payload);

        toast.promise(promise, {
            loading: "Creating event...",
            success: "Event created successfully!",
            error: "Failed to create event",
        });

        try {
            await promise;
            onSuccess?.();
            form.resetFields();
        } catch (err) {
            if (err.response?.status === 422) {
                console.log("Validation Errors:", err.response.data.errors);
                toast.error("Validation failed. Check console.");
            } else {
                toast.error("Something went wrong.");
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
                <Col xs={24}>
                    <Form.Item
                        name="event_name"
                        label="Event Name"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Enter event name" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        name="event_date"
                        label="Date"
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

            {/* TIME FIELDS */}
            {attendanceType === "single" && (
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="start_time"
                            label="Time In"
                            rules={[{ required: true }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="end_time"
                            label="Time Out"
                            rules={[{ required: true }]}
                        >
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
                        <Col xs={24} md={12} key={name}>
                            <Form.Item
                                name={name}
                                label={label}
                                rules={[{ required: true }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
            )}

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="attendance_duration"
                        label="Attendance Duration (minutes)"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="location_id"
                        label="Location"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Select Location">
                            {locations
                                ?.filter(l => l.status === 1)
                                .map(l => (
                                    <Select.Option key={l.id} value={l.id}>
                                        {l.location_name} ({l.address})
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="sanction_id"
                        label="Sanction"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Select Sanction">
                            {sanctions
                                ?.filter(s => s.status === 1)
                                .map(s => (
                                    <Select.Option key={s.id} value={s.id}>
                                        {s.sanction_name}{" "}
                                        {s.sanction_type === "monetary"
                                            ? `(Php ${s.monetary_amount})`
                                            : `(${s.service_time} ${s.service_time_type})`}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <Form.Item
                name="school_year_id"
                label="School Year"
                rules={[{ required: true }]}
            >
                <Select>
                    {school_structure?.school_years?.map(y => (
                        <Select.Option key={y.id} value={y.id}>
                            {y.start_year}-{y.end_year} {y.semester.semester_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>


            <Form.Item
                name="participant_course_id"
                label="Courses"
                rules={[{ required: true, message: "Select at least one course" }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select courses"
                    allowClear
                >
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
                rules={[{ required: true, message: "Select at least one year level" }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select year levels"
                    allowClear
                >
                    {availableYearLevels.map(y => (
                        <Select.Option key={y.id} value={y.id}>
                            {y.year_level_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Button
                type="primary"
                htmlType="submit"
                loading={processing}
                block
            >
                Create Event
            </Button>
        </Form>
    );
}