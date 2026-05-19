import { useEffect, useState } from "react";
import axios from "axios";
import {
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Switch,
    message,
    Space,
    Alert,
    Divider,
} from "antd";

export default function Update({ sanction, onSuccess }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);
    const [sanctionType, setSanctionType] = useState("");

    // Prefill form
    useEffect(() => {
        if (sanction) {
            form.setFieldsValue({
                sanction_type: sanction.sanction_type,
                sanction_name: sanction.sanction_name || "",
                sanction_description: sanction.sanction_description || "",
                monetary_amount: sanction.monetary_amount || null,
                service_time: sanction.service_time || null,
                service_time_type: sanction.service_time_type || "",
                status: sanction.status === 1,
            });

            setSanctionType(sanction.sanction_type);
        }
    }, [sanction, form]);

    const handleSubmit = async (values) => {
        setProcessing(true);

        try {
            const payload = {
                ...values,
                status: values.status ? 1 : 0,
            };

            await axios.patch(`/setup/sanction/${sanction.id}`, payload);

            message.success("Sanction updated successfully!");

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
                message.error("Failed to update sanction");
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
            {/* TYPE */}
            <Form.Item
                label="Sanction Type"
                name="sanction_type"
                rules={[{ required: true, message: "Sanction type is required" }]}
            >
                <Select
                    placeholder="Select type"
                    onChange={(value) => setSanctionType(value)}
                    options={[
                        { value: "monetary", label: "Monetary" },
                        { value: "service", label: "Service" },
                    ]}
                />
            </Form.Item>

            {/* NAME */}
            <Form.Item
                label="Sanction Name"
                name="sanction_name"
                rules={[{ required: true, message: "Sanction name is required" }]}
            >
                <Input style={{ textTransform: "uppercase" }} />
            </Form.Item>

            {/* DESCRIPTION */}
            <Form.Item
                label="Description"
                name="sanction_description"
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            {/* MONETARY */}
            {sanctionType === "monetary" && (
                <Form.Item
                    label="Monetary Amount"
                    name="monetary_amount"
                    rules={[{ required: true, message: "Amount is required" }]}
                >
                    <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
            )}

            {/* SERVICE */}
            {sanctionType === "service" && (
                <>
                    <Form.Item
                        label="Service Time"
                        name="service_time"
                        rules={[{ required: true, message: "Service time is required" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                        label="Time Type"
                        name="service_time_type"
                        rules={[{ required: true, message: "Time type is required" }]}
                    >
                        <Select
                            options={[
                                { value: "minutes", label: "Minutes" },
                                { value: "hours", label: "Hours" },
                            ]}
                        />
                    </Form.Item>
                </>
            )}

            <Divider />

            {/* STATUS */}
            <Form.Item name="status" valuePropName="checked">
                <div>
                    <Space
                        align="center"
                        style={{ width: "100%", justifyContent: "space-between" }}
                    >
                        <div>
                            <div style={{ fontWeight: 500 }}>
                                Move to bin
                            </div>
                            <div style={{ fontSize: 12, color: "#888" }}>
                                This action cannot be undone
                            </div>
                        </div>

                        <Form.Item name="status" valuePropName="checked" noStyle>
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
                                    message="This sanction will be marked as inactive"
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