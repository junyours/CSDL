import { useState } from "react";
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
} from "antd";

const { Option } = Select;

export default function Create({ auth, onSuccess }) {
    const [form] = Form.useForm();

    const [data, setData] = useState({
        user_id_no: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        email_address: "",
        user_role: "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (field, value) => {
        setData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        setProcessing(true);
        setErrors({});

        const payload = {
            ...data,
            first_name: data.first_name.toUpperCase(),
            last_name: data.last_name.toUpperCase(),
            middle_name: data.middle_name?.toUpperCase(),
            user_id_no: data.user_id_no.toUpperCase(),
        };

        const promise = axios.post("/manage-user/store", payload);

        toast.promise(promise, {
            loading: "Creating user...",
            success: "User created successfully!",
            error: "Failed to create user",
        });

        try {
            await promise;

            onSuccess?.();

            form.resetFields();
            setData({
                user_id_no: "",
                first_name: "",
                last_name: "",
                middle_name: "",
                email_address: "",
                user_role: "",
            });

        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                console.error(error);
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
            {/* First & Middle Name */}
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="First Name"
                        validateStatus={errors.first_name ? "error" : ""}
                        help={errors.first_name?.[0]}
                    >
                        <Input
                            value={data.first_name}
                            onChange={(e) =>
                                handleChange("first_name", e.target.value)
                            }
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item label="Middle Name">
                        <Input
                            value={data.middle_name}
                            onChange={(e) =>
                                handleChange("middle_name", e.target.value)
                            }
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>

                    {/* Last Name */}
                    <Form.Item
                        label="Last Name"
                        validateStatus={errors.last_name ? "error" : ""}
                        help={errors.last_name?.[0]}
                    >
                        <Input
                            value={data.last_name}
                            onChange={(e) =>
                                handleChange("last_name", e.target.value)
                            }
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            {/* Email */}
            <Form.Item
                validateStatus={errors.email_address ? "error" : ""}
                help={errors.email_address?.[0]}
                label="Email Address"
            >
                <Input
                    type="email"
                    value={data.email_address}
                    onChange={(e) =>
                        handleChange("email_address", e.target.value)
                    }
                />
            </Form.Item>

            {/* User ID & Role */}
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="User ID No"
                        validateStatus={errors.user_id_no ? "error" : ""}
                        help={errors.user_id_no?.[0]}
                    >
                        <Input
                            value={data.user_id_no}
                            onChange={(e) =>
                                handleChange("user_id_no", e.target.value)
                            }
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        label="User Role"
                        validateStatus={errors.user_role ? "error" : ""}
                        help={errors.user_role?.[0]}
                    >
                        <Select
                            placeholder="Select role"
                            value={data.user_role || undefined}
                            onChange={(value) =>
                                handleChange("user_role", value)
                            }
                        >
                            <Option value="security">Security Personnel</Option>
                            <Option value="guidance_counselor">Guidance Counselor</Option>

                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            {/* Submit */}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                    style={{ marginTop: "15px" }}
                >
                    {processing ? "Saving..." : "Save"}
                </Button>
            </Form.Item>
            <Alert
                type="info"
                showIcon
                message="Default Password"
                description="The default password is the User ID number. Make sure the user changes it after their first login."
            />
        </Form >
    );
}