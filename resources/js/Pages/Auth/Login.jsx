import { useState } from "react";

import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    theme,
    Grid,
} from "antd";

import {
    EyeInvisibleOutlined,
    EyeTwoTone,
    UserOutlined,
    LockOutlined
} from "@ant-design/icons";

import axios from "axios";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";
import { useTheme } from "../../ThemeContext";
import Link from "antd/es/typography/Link";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Login() {
    const [form] = Form.useForm();

    const [processing, setProcessing] = useState(false);

    const { isDark } = useTheme();

    const { token } = theme.useToken();

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const handleSubmit = async (values) => {
        setProcessing(true);

        const loading = toast.loading("Signing in...");

        try {
            const response = await axios.post("/login", values);

            toast.success("Login Success!", {
                id: loading,
            });

            router.visit(response.data.redirect);

        } catch (error) {
            toast.error("Invalid credentials", {
                id: loading,
            });

            const errors = error.response?.data?.errors;

            if (errors) {
                form.setFields([
                    {
                        name: "user_id_no",
                        errors: errors.user_id_no || [],
                    },
                ]);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Card
            bordered={false}
            style={{
                background: "transparent",
                boxShadow: "none",
                overflow: "hidden",
            }}
            bodyStyle={{
                background: "transparent",
            }}
        >
            <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
            >
                {/* HEADER */}
                <div>
                    <Text type="primary">
                        Log in to CSDL App
                    </Text>
                </div>

                {/* FORM */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        name="user_id_no"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your ID number",
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="ID number"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your password",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            iconRender={(visible) =>
                                visible
                                    ? <EyeTwoTone />
                                    : <EyeInvisibleOutlined />
                            }
                        />
                    </Form.Item>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: 24,
                        }}
                    >
                        <a href="/forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        block
                        size="large"
                        style={{
                            height: 52,
                            fontWeight: 600,
                            borderRadius: 14,
                        }}
                    >
                        {processing ? "Logging in..." : "Login"}
                    </Button>
                </Form>

                {/* FOOTER */}
                <div style={{ textAlign: "center" }}>
                    <Text type="secondary">
                        Register your student account{" "}
                        <Link href="/register">here</Link>.
                    </Text>
                </div>
            </Space>
        </Card>
    );
}