import { useEffect, useState } from "react";
import axios from "axios";
import {
    Form,
    Input,
    Button,
    Switch,
    message,
    Space,
    Alert,
    Divider,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function Update({ violation, onSuccess }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);

    // Prefill form
    useEffect(() => {
        if (violation) {
            form.setFieldsValue({
                violation_code: violation.violation_code || "",
                violation_description: violation.violation_description || "",
                status: violation.status === 1, // true = active
            });
        }
    }, [violation, form]);

    const handleSubmit = async (values) => {
        setProcessing(true);

        try {
            const payload = {
                ...values,
                status: values.status ? 1 : 0, // convert back to backend format
            };

            await axios.patch(`/setup/violation/${violation.id}`, payload);

            message.success("Violation updated successfully!");

            onSuccess?.();

        } catch (error) {
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;

                const formatted = Object.keys(serverErrors).map((key) => ({
                    name: key,
                    errors: [serverErrors[key][0]],
                }));

                form.setFields(formatted);
            } else {
                message.error("Failed to update violation");
                console.error(error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
        >

            {/* VIOLATION CODE */}
            <Form.Item
                label="Violation Code"
                name="violation_code"
                rules={[
                    { required: true, message: "Violation code is required" },
                ]}
            >
                <Input
                    placeholder="Enter violation code"
                    style={{ textTransform: "uppercase" }}
                />
            </Form.Item>

            {/* DESCRIPTION */}
            <Form.Item
                label="Description"
                name="violation_description"
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Describe the violation"
                />
            </Form.Item>

            <Divider />

            {/* STATUS / DELETE SECTION */}
            <Form.Item
                name="status"
                valuePropName="checked"
            >
                <div>
                    <Space
                        align="center"
                        style={{ width: "100%", justifyContent: "space-between" }}
                    >
                        <Space>
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    Move to bin
                                </div>
                                <div style={{ fontSize: 12, color: "#888" }}>
                                    This action cannot be undone
                                </div>
                            </div>
                        </Space>

                        <Form.Item
                            name="status"
                            valuePropName="checked"
                            noStyle
                        >
                            <Switch
                                checkedChildren="Delete"
                                unCheckedChildren="Undo"
                            />
                        </Form.Item>
                    </Space>

                    {/* Warning */}
                    <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) =>
                            !getFieldValue("status") && (
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="This violation will be marked as inactive"
                                    style={{ marginTop: 12 }}
                                />
                            )
                        }
                    </Form.Item>
                </div>
            </Form.Item>

            {/* SUBMIT */}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                >
                    Update
                </Button>
            </Form.Item>

        </Form>
    );
}