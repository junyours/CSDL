import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Avatar,
  Space,
  ConfigProvider,
  theme
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined
} from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../../ThemeContext";

const { Title, Text } = Typography;

export default function ResetPassword({ token, email }) {
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);

  const { isDark } = useTheme();

  const handleSubmit = async (values) => {
    setProcessing(true);

    const payload = {
      token,
      email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };

    const promise = axios.post("/reset-password", payload);

    toast.promise(promise, {
      loading: "Resetting password...",
      success: "Password reset successful!",
      error: "Failed to reset password",
    });

    try {
      await promise;
      window.location.href = "/";
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;

        form.setFields(
          Object.keys(errors).map((key) => ({
            name: key,
            errors: errors[key],
          }))
        );
      }
    } finally {
      setProcessing(false);
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
            maxWidth: 420,
            borderRadius: 12,
          }}
          bodyStyle={{ padding: 28 }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0 }}>
              Reset Password
            </Title>
            <Text type="secondary">
              Enter your new password below
            </Text>
          </div>

          {/* FORM */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* EMAIL (READ ONLY) */}
            <Form.Item label="Email">
              <Input
                value={email}
                disabled
                prefix={<MailOutlined />}
                size="large"
              />
            </Form.Item>

            {/* NEW PASSWORD */}
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
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* CONFIRM PASSWORD */}
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
                    return Promise.reject(
                      new Error("Passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="Confirm new password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* SUBMIT */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={processing}
                style={{ marginTop: "15px" }}
              >
                {processing ? "Resetting..." : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>

          {/* BACK TO LOGIN */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <a href="/">Back to Login</a>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}