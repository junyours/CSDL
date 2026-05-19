import { useState } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    ConfigProvider,
    theme,
    Steps,
    Spin,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    SendOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../../ThemeContext";
import { UserRoundSearch } from "lucide-react";

const { Title, Text } = Typography;

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [userIdNo, setUserIdNo] = useState("");
    const [email, setEmail] = useState("");

    const { isDark } = useTheme();

    const maskEmail = (email) => {
        if (!email) return "";
        const [name, domain] = email.split("@");

        if (name.length <= 7) return name[0] + "****@" + domain;

        return `${name.slice(0, 6)}****${name.slice(-1)}@${domain}`;
    };

    // STEP 1: FETCH EMAIL
    const handleFetchAccount = async (values) => {
        setLoading(true);

        try {
            setUserIdNo(values.user_id_no); 

            const res = await axios.post("/forgot-password/email", {
                user_id_no: values.user_id_no,
            });

            setEmail(res.data.email);
            setStep(1);

            toast.success("Account found!");
        } catch (err) {
            console.error(err.response?.data);

            toast.error(
                err.response?.data?.errors?.user_id_no?.[0] ||
                "Unable to find account"
            );

            if (err.response?.status === 422) {
                form.setFields([
                    {
                        name: "user_id_no",
                        errors: err.response.data.errors.user_id_no || [],
                    },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendReset = async () => {
        setLoading(true);

        const payload = {
            user_id_no: userIdNo,
        };

        console.log("Sending payload:", payload);

        try {
            await axios.post("/forgot-password/send", payload);

            toast.success("Reset link sent!");

            form.resetFields();
            setEmail("");
            setUserIdNo("");
            setStep(0);
        } catch (err) {
            console.error(err.response?.data);

            toast.error(
                err.response?.data?.errors?.user_id_no?.[0] ||
                err.response?.data?.errors?.email?.[0] ||
                "Failed to send reset link"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
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
                }}
            >

                <Card
                    style={{
                        width: "100%",
                        maxWidth: 450,
                        borderRadius: 12,
                    }}
                    bodyStyle={{ padding: 28 }}
                >
                    {/* HEADER */}
                    <div style={{ marginBottom: 20 }}>
                        <Title level={3} style={{ margin: 0 }}>
                            Forgot Password
                        </Title>
                        <Text type="secondary">
                            Recover your account securely
                        </Text>
                    </div>

                    {/* STEPS */}
                    <Steps
                        size="small"
                        current={step}
                        items={[
                            { title: "Find Account", icon: <UserRoundSearch /> },
                            { title: "Confirm Email", icon: <MailOutlined /> },
                        ]}
                        style={{ marginBottom: 24 }}
                    />

                    {/* STEP 1 FORM */}
                    {step === 0 && (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFetchAccount}
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
                                <Spin spinning={loading} indicator={null}>
                                    <Input.Search
                                        size="large"
                                        placeholder="Enter your ID Number"
                                        enterButton
                                        onSearch={(value) => {
                                            form.submit(); // This will trigger the onFinish handler
                                        }}
                                        disabled={loading}
                                    />
                                </Spin>
                            </Form.Item>
                        </Form>
                    )}

                    {/* STEP 2 */}
                    {step === 1 && (
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Form layout="vertical">
                                <Form.Item label="Registered Email">
                                    <Input
                                        value={maskEmail(email)}
                                        disabled
                                        prefix={<MailOutlined />}
                                        size="large"
                                    />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    loading={loading}
                                    icon={<SendOutlined />}
                                    onClick={handleSendReset}
                                    style={{ marginTop: '10px' }}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>

                                <Button
                                    block
                                    style={{ marginTop: 10 }}
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setStep(0)}
                                >
                                    Not your email? Try again
                                </Button>
                            </Form>
                        </Space>
                    )}

                    {/* FOOTER */}
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <a href="/">Back to Login</a>
                    </div>
                </Card>
            </div>
        </ConfigProvider>
    );
}