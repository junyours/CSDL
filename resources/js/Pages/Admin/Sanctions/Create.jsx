import { useState } from "react";
import axios from "axios";
import {
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Switch,
    message,
} from "antd";

const { TextArea } = Input;

export default function Create({ onSuccess }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);
    const [sanctionType, setSanctionType] = useState("");

    const handleSubmit = async (values) => {
        setProcessing(true);

        try {
            await axios.post("/setup/sanction/store", values);

            message.success("Sanction created successfully!");

            form.resetFields();
            setSanctionType("");

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
                message.error("Failed to create sanction");
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
            initialValues={{
                sanction_type: "",
                sanction_name: "",
                sanction_description: "",
                monetary_amount: "",
                service_time: "",
                service_time_type: "",
                status: true,
            }}
        >

            {/* TYPE */}
            <Form.Item
                label="Type"
                name="sanction_type"
                rules={[
                    { required: true, message: "Sanction type is required" },
                ]}
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
                rules={[
                    { required: true, message: "Sanction name is required" },
                ]}
            >
                <Input
                    style={{ textTransform: "uppercase" }}
                />
            </Form.Item>

            {/* DESCRIPTION */}
            <Form.Item
                label="Description"
                name="sanction_description"
            >
                <TextArea
                    rows={4}
                    placeholder="Optional description"
                />
            </Form.Item>

            {/* MONETARY FIELDS */}
            {sanctionType === "monetary" && (
                <Form.Item
                    label="Monetary Amount"
                    name="monetary_amount"
                    rules={[
                        { required: true, message: "Monetary amount is required" },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Enter amount"
                        min={0}
                    />
                </Form.Item>
            )}

            {/* SERVICE FIELDS */}
            {sanctionType === "service" && (
                <>
                    <Form.Item
                        label="Service Time"
                        name="service_time"
                        rules={[
                            { required: true, message: "Service time is required" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Enter service time"
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Time Type"
                        name="service_time_type"
                        rules={[
                            { required: true, message: "Time type is required" },
                        ]}
                    >
                        <Select
                            placeholder="Select type"
                            options={[
                                { value: "minutes", label: "Minutes" },
                                { value: "hours", label: "Hours" },
                            ]}
                        />
                    </Form.Item>
                </>
            )}

            {/* SUBMIT */}
            <Form.Item style={{ marginTop: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                >
                    Save Sanction
                </Button>
            </Form.Item>

        </Form>
    );
}