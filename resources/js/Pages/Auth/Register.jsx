import { useState } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    ConfigProvider,
    theme,
    Space,
    Switch,
    Alert,
    DatePicker
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    CalendarOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    MoonOutlined,
    SunOutlined
} from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";
import { useTheme } from "../../ThemeContext";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function Register() {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);
    const [errorAttempts, setErrorAttempts] = useState(0);

    const { isDark, toggleTheme } = useTheme();

    const handleSubmit = async (values) => {
        setProcessing(true);

        const payload = {
            ...values,
            birthdate: values.birthdate
                ? values.birthdate.format("YYYY-MM-DD")
                : null,
        };

        const promise = axios.post("/register", payload);

        toast.promise(promise, {
            loading: "Creating account...",
            success: "Registration successful!",
            error: "Registration failed",
        });

        try {
            const response = await promise;
            setErrorAttempts(0);
            window.location.href = response.data.redirect;
        } catch (error) {
            if (error.response?.status === 422) {
                form.setFields(
                    Object.keys(error.response.data.errors).map((key) => ({
                        name: key,
                        errors: error.response.data.errors[key],
                    }))
                );
                setErrorAttempts((prev) => prev + 1);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
            }}
        >
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                    background: isDark ? "#141414" : "#f0f2f5",
                    flexDirection: "column",
                }}
            >
                {/* Theme Toggle */}
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                    <Switch
                        checked={isDark}
                        onChange={toggleTheme}
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<SunOutlined />}
                    />
                </div>
                <img

                    src={isDark ? "./assets/images/darkMode-csdl-logo.png" : "./assets/images/defaultMode-csdl-logo.png"} alt="Logo" className="mb-2 sm:mb-0 h-[60px] w-auto"

                />

                <div className="hidden sm:flex items-center justify-center p-4 text-center">
                    <div>
                        <Text type="secondary" className="text-[12px] font-bold leading-tight">
                            CENTER FOR STUDENT DEVELOPMENT AND LEADERSHIP
                        </Text>
                        <div className="text-[15px] font-light opacity-70">
                            <Text type="secondary">OPOL COMMUNITY COLLEGE</Text>
                        </div>
                    </div>
                </div>

                <Text type="secondary" className="mb-4 sm:hidden text-xs font-m opacity-70">CSDL - OPOL COMMUNITY COLLEGE</Text>

                {/* CARD */}
                <Card
                    style={{
                        width: "100%",
                        maxWidth: 420,
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    bodyStyle={{ padding: 20 }}
                >
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <Space direction="vertical" size="small" align="center" style={{ width: '100%' }}>

                            {/* SUBTEXT */}
                            <Text type="secondary" level={5} style={{
                                color: isDark ? "#a5a5a5" : "#030064",
                            }}>
                                Sign up for student account
                            </Text>
                        </Space>
                    </div>

                    {errorAttempts >= 2 && (
                        <Alert
                            type="warning"
                            showIcon
                            message="Still can't find your record?"
                            description={
                                <>
                                    Please visit and login <a style={{textDecoration: "underline"}} href="https://www.sis.occph.com/profile" target="_blank" rel="noopener noreferrer" >
                                        www.sis.occph.com
                                    </a> for verification or contact the IT Administrator for assistance.
                                </>
                            }
                            style={{
                                marginBottom: 16,
                                borderRadius: 8,
                            }}
                        />
                    )}

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="ID Number"
                            name="user_id_no"
                            rules={[{ required: true }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Last Name"
                            name="last_name"
                            rules={[{ required: true }]}
                        >
                            <Input
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Birthdate"
                            name="birthdate"
                            rules={[{ required: true, message: "Please select your birthdate" }]}
                        >
                            <DatePicker
                                size="large"
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email" }]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Create Password"
                            name="password"
                            rules={[{ required: true }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                size="large"
                                iconRender={(visible) =>
                                    visible ? (
                                        <EyeTwoTone />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    )
                                }
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={processing}
                            >
                                {processing ? "Registering..." : "Register"}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: "center" }}>
                        <a href="/">Already have an account? Login</a>
                    </div>
                </Card>
            </div>
        </ConfigProvider>
    );
}