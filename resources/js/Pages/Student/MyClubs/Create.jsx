import { useState } from "react";
import axios from "axios";
import {
    Form,
    Input,
    Button,
    Upload,
    message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function Create({ onSuccess }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);

    // Convert Upload event → fileList
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleSubmit = async (values) => {
        setProcessing(true);

        try {
            const formData = new FormData();

            formData.append("club_name", values.club_name);

            // Get actual files
            const logoFile = values.club_logo?.[0]?.originFileObj;
            const cblFile = values.club_cbl_file?.[0]?.originFileObj;

            if (logoFile) formData.append("club_logo", logoFile);
            if (cblFile) formData.append("club_cbl_file", cblFile);

            await axios.post("/student/create-club", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            message.success("New Club created successfully!");

            form.resetFields();
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
                message.error("Failed to create club");
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
            {/* CLUB NAME */}
            <Form.Item
                label="Club Name"
                name="club_name"
                rules={[
                    { required: true, message: "Club name is required" },
                ]}
            >
                <Input style={{ textTransform: "uppercase" }} />
            </Form.Item>

            {/* LOGO UPLOAD */}
            <Form.Item
                label="Club Logo"
                name="club_logo"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[
                    { required: true, message: "Club logo is required" },
                ]}
            >
                <Upload
                    beforeUpload={() => false} // prevent auto upload
                    maxCount={1}
                    accept="image/*"
                >
                    <Button icon={<UploadOutlined />}>
                        Select Logo
                    </Button>
                </Upload>
            </Form.Item>

            {/* CBL FILE UPLOAD */}
            <Form.Item
                label="CBL File"
                name="club_cbl_file"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[
                    { required: true, message: "CBL file is required" },
                ]}
            >
                <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".pdf,.doc,.docx"
                >
                    <Button icon={<UploadOutlined />}>
                        Select CBL File
                    </Button>
                </Upload>
            </Form.Item>

            {/* SUBMIT */}
            <Form.Item style={{ marginTop: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                >
                    Create
                </Button>
            </Form.Item>
        </Form>
    );
}