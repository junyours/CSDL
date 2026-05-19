import { useState } from "react";
import axios from "axios";
import {
    Form,
    Input,
    Button,
    Switch,
    message,
    Space,
} from "antd";

export default function Create({ onSuccess }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (values) => {
        setProcessing(true);

        try {
            await axios.post("/setup/violation", values);

            message.success("Violation created successfully!");

            form.resetFields();

            onSuccess?.(); // close modal + refresh

        } catch (error) {
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;

                // Map Laravel errors → AntD form
                const formatted = Object.keys(serverErrors).map((key) => ({
                    name: key,
                    errors: [serverErrors[key][0]],
                }));

                form.setFields(formatted);
            } else {
                message.error("Failed to create violation");
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
                violation_code: "",
                violation_description: "",
                status: true,
            }}
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
                    placeholder="Optional description"
                />
            </Form.Item>

            {/* SUBMIT */}
            <Form.Item style={{ marginTop: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                >
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
}