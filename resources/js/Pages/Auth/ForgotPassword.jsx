// import { useState } from "react";
// import {
//     Form,
//     Input,
//     Button,
//     Card,
//     Typography,
//     Space,
//     ConfigProvider,
//     theme,
//     Steps,
//     Spin,
// } from "antd";
// import {
//     UserOutlined,
//     MailOutlined,
//     SendOutlined,
//     ArrowLeftOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useTheme } from "../../ThemeContext";
// import { UserRoundSearch } from "lucide-react";

// const { Title, Text } = Typography;

// export default function ForgotPassword() {
//     const [form] = Form.useForm();
//     const [step, setStep] = useState(0);
//     const [loading, setLoading] = useState(false);

//     const [userIdNo, setUserIdNo] = useState("");
//     const [email, setEmail] = useState("");

//     const { isDark } = useTheme();

//     const maskEmail = (email) => {
//         if (!email) return "";
//         const [name, domain] = email.split("@");

//         if (name.length <= 7) return name[0] + "****@" + domain;

//         return `${name.slice(0, 6)}****${name.slice(-1)}@${domain}`;
//     };

//     // STEP 1: FETCH EMAIL
//     const handleFetchAccount = async (values) => {
//         setLoading(true);

//         try {
//             setUserIdNo(values.user_id_no); 

//             const res = await axios.post("/forgot-password/email", {
//                 user_id_no: values.user_id_no,
//             });

//             setEmail(res.data.email);
//             setStep(1);

//             toast.success("Account found!");
//         } catch (err) {
//             console.error(err.response?.data);

//             toast.error(
//                 err.response?.data?.errors?.user_id_no?.[0] ||
//                 "Unable to find account"
//             );

//             if (err.response?.status === 422) {
//                 form.setFields([
//                     {
//                         name: "user_id_no",
//                         errors: err.response.data.errors.user_id_no || [],
//                     },
//                 ]);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSendReset = async () => {
//         setLoading(true);

//         const payload = {
//             user_id_no: userIdNo,
//         };

//         console.log("Sending payload:", payload);

//         try {
//             await axios.post("/forgot-password/send", payload);

//             toast.success("Reset link sent!");

//             form.resetFields();
//             setEmail("");
//             setUserIdNo("");
//             setStep(0);
//         } catch (err) {
//             console.error(err.response?.data);

//             toast.error(
//                 err.response?.data?.errors?.user_id_no?.[0] ||
//                 err.response?.data?.errors?.email?.[0] ||
//                 "Failed to send reset link"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <ConfigProvider
//             theme={{
//                 algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
//             }}
//         >
//             <div
//                 style={{
//                     minHeight: "100vh",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     padding: 16,
//                     background: isDark ? "#141414" : "#f0f2f5",
//                 }}
//             >

//                 <Card
//                     style={{
//                         width: "100%",
//                         maxWidth: 450,
//                         borderRadius: 12,
//                     }}
//                     bodyStyle={{ padding: 28 }}
//                 >
//                     {/* HEADER */}
//                     <div style={{ marginBottom: 20 }}>
//                         <Title level={3} style={{ margin: 0 }}>
//                             Forgot Password
//                         </Title>
//                         <Text type="secondary">
//                             Recover your account securely
//                         </Text>
//                     </div>

//                     {/* STEPS */}
//                     <Steps
//                         size="small"
//                         current={step}
//                         items={[
//                             { title: "Find Account", icon: <UserRoundSearch /> },
//                             { title: "Confirm Email", icon: <MailOutlined /> },
//                         ]}
//                         style={{ marginBottom: 24 }}
//                     />

//                     {/* STEP 1 FORM */}
//                     {step === 0 && (
//                         <Form
//                             form={form}
//                             layout="vertical"
//                             onFinish={handleFetchAccount}
//                         >
//                             <Form.Item
//                                 name="user_id_no"
//                                 rules={[
//                                     {
//                                         required: true,
//                                         message: "Please enter your ID number",
//                                     },
//                                 ]}
//                             >
//                                 <Spin spinning={loading} indicator={null}>
//                                     <Input.Search
//                                         size="large"
//                                         placeholder="Enter your ID Number"
//                                         enterButton
//                                         onSearch={(value) => {
//                                             form.submit(); // This will trigger the onFinish handler
//                                         }}
//                                         disabled={loading}
//                                     />
//                                 </Spin>
//                             </Form.Item>
//                         </Form>
//                     )}

//                     {/* STEP 2 */}
//                     {step === 1 && (
//                         <Space direction="vertical" style={{ width: "100%" }}>
//                             <Form layout="vertical">
//                                 <Form.Item label="Registered Email">
//                                     <Input
//                                         value={maskEmail(email)}
//                                         disabled
//                                         prefix={<MailOutlined />}
//                                         size="large"
//                                     />
//                                 </Form.Item>

//                                 <Button
//                                     type="primary"
//                                     block
//                                     size="large"
//                                     loading={loading}
//                                     icon={<SendOutlined />}
//                                     onClick={handleSendReset}
//                                     style={{ marginTop: '10px' }}
//                                 >
//                                     {loading ? "Sending..." : "Send Reset Link"}
//                                 </Button>

//                                 <Button
//                                     block
//                                     style={{ marginTop: 10 }}
//                                     icon={<ArrowLeftOutlined />}
//                                     onClick={() => setStep(0)}
//                                 >
//                                     Not your email? Try again
//                                 </Button>
//                             </Form>
//                         </Space>
//                     )}

//                     {/* FOOTER */}
//                     <div style={{ textAlign: "center", marginTop: 16 }}>
//                         <a href="/">Back to Login</a>
//                     </div>
//                 </Card>
//             </div>
//         </ConfigProvider>
//     );
// }



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
    LockOutlined,
    EyeTwoTone,
    EyeInvisibleOutlined
} from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../../ThemeContext";
import { UserRoundSearch } from "lucide-react";

const { Title, Text } = Typography;

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [userIdNo, setUserIdNo] = useState("");
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(""); // Stores bypass token from backend

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
                err.response?.data?.errors?.user_id_no?.[0] || "Unable to find account"
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

    // STEP 2: BYPASS EMAIL LINK & FETCH THE GENERATED TOKEN
    const handleSendReset = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/forgot-password/send", { user_id_no: userIdNo });

            // Store token dynamically
            setToken(res.data.token);

            toast.success("Identity Confirmed! Set your new password.");
            setStep(2); // Push interface directly into the change password step
        } catch (err) {
            console.error(err.response?.data);
            toast.error(
                err.response?.data?.errors?.user_id_no?.[0] || "Failed to initiate reset route"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 3: SUBMIT NEW PASSWORD DIRECTLY
    const handleResetSubmit = async (values) => {
        setLoading(true);

        const payload = {
            token,
            email,
            password: values.password,
            password_confirmation: values.password_confirmation,
        };

        try {
            await axios.post("/reset-password", payload);
            toast.success("Password reset successful!");

            // Cleanup and return home
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                resetForm.setFields(
                    Object.keys(errors).map((key) => ({
                        name: key,
                        errors: errors[key],
                    }))
                );
            } else {
                toast.error("Failed to reset password");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
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
                    style={{ width: "100%", maxWidth: 450, borderRadius: 12 }}
                    bodyStyle={{ padding: 28 }}
                >
                    {/* HEADER */}
                    <div style={{ marginBottom: 20 }}>
                        <Title level={3} style={{ margin: 0 }}>
                            {step === 2 ? "Set New Password" : "Forgot Password"}
                        </Title>
                        <Text type="secondary">
                            {step === 2 ? "Enter your new password below" : "Recover your account securely"}
                        </Text>
                    </div>

                    {/* STEPS TIMELINE */}
                    <Steps
                        size="small"
                        current={step}
                        items={[
                            { title: "Find Account", icon: <UserRoundSearch size={16} /> },
                            { title: "Confirm", icon: <MailOutlined /> },
                            { title: "Reset", icon: <LockOutlined /> },
                        ]}
                        style={{ marginBottom: 24 }}
                    />

                    {/* STEP 1 FORM: FETCH USER */}
                    {step === 0 && (
                        <Form form={form} layout="vertical" onFinish={handleFetchAccount}>
                            <Form.Item
                                name="user_id_no"
                                rules={[{ required: true, message: "Please enter your ID number" }]}
                            >
                                <Spin spinning={loading} indicator={null}>
                                    <Input.Search
                                        size="large"
                                        placeholder="Enter your ID Number"
                                        enterButton
                                        onSearch={() => form.submit()}
                                        disabled={loading}
                                    />
                                </Spin>
                            </Form.Item>
                        </Form>
                    )}

                    {/* STEP 2 FORM: REVEAL AND CONFIRM METADATA */}
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
                                    Continue to Password Change
                                </Button>

                                <Button
                                    block
                                    style={{ marginTop: 10 }}
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setStep(0)}
                                >
                                    Not your account? Try again
                                </Button>
                            </Form>
                        </Space>
                    )}

                    {/* STEP 3 FORM: DIRECT CHANGE PASSWORD (BYPASSED GMAIL LINK) */}
                    {step === 2 && (
                        <Form form={resetForm} layout="vertical" onFinish={handleResetSubmit}>
                            <Form.Item label="Email Account">
                                <Input value={email} disabled prefix={<MailOutlined />} size="large" />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Please enter new password" },
                                    { min: 6, message: "Password must be at least 6 characters" },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    size="large"
                                    placeholder="Enter new password"
                                    iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="password_confirmation"
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: "Please confirm your password" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Passwords do not match"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    size="large"
                                    placeholder="Confirm new password"
                                    iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                style={{ marginTop: "15px" }}
                            >
                                Update Password
                            </Button>
                        </Form>
                    )}

                    {/* FOOTER */}
                    {step !== 2 && (
                        <div style={{ textAlign: "center", marginTop: 16 }}>
                            <a href="/">Back to Login</a>
                        </div>
                    )}
                </Card>
            </div>
        </ConfigProvider>
    );
}