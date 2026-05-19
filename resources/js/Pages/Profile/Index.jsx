import React, { useRef, useState } from "react";
import {
    Layout, Card, Avatar, Typography, Row, Col, Button,
    Descriptions, Modal, Form, Input, Divider, Slider,
    Space,
    Alert,
    Collapse
} from "antd";
import {
    UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
    EnvironmentOutlined, LockOutlined, CameraOutlined, LogoutOutlined,
    ManOutlined
} from "@ant-design/icons";
import AppLayout from "../../Layouts/AppLayout";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import axios from 'axios';
import Cropper from "react-easy-crop";

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function Index({ auth, studentData, userInfoData, avatar }) {
    const user = auth?.user;
    const data = user?.user_role === "student" ? studentData : userInfoData;

    // Avatar States
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Password States
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordForm] = Form.useForm();
    const fileInputRef = useRef(null);

    // Handlers
    const handleLogout = () => router.post("/logout");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = (_, pixels) => setCroppedAreaPixels(pixels);

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await new Promise((res, rej) => {
            const img = new Image();
            img.addEventListener("load", () => res(img));
            img.addEventListener("error", (e) => rej(e));
            img.setAttribute("crossOrigin", "anonymous");
            img.src = imageSrc;
        });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 400; canvas.height = 400;
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 400, 400);
        return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
    };

    const handleCropSave = async () => {
        if (!croppedAreaPixels || isUploading) return;
        setIsUploading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            router.post("/profile/avatar", { avatar: croppedBlob }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowCropModal(false);
                    setImageSrc(null);
                    router.reload({ only: ['avatar'] });
                }
            });
            toast.success("Profile picture updated!");
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const onFinishPassword = async (values) => {
        setLoadingPassword(true);
        try {
            const res = await axios.post('/profile/change-password', {
                new_password: values.newPassword,
                new_password_confirmation: values.confirmPassword,
            });
            toast.success(res.data.message);
            passwordForm.resetFields();
        } catch (err) {
            toast.error(err.response?.data?.errors?.new_password?.[0] || "Failed to change password");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <AppLayout user={user} breadcrumbs={["Profile"]}>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 16px' }}>

                {/* Header Card */}
                <Card
                    bordered={false}
                    className="overflow-hidden mb-6 shadow-sm"
                    bodyStyle={{ padding: 0 }}
                >
                    <div
                        className="w-full"
                        style={{
                            backgroundImage: "url('/assets/images/cover.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            aspectRatio: "3 / 1", // 🔥 responsive height
                        }}
                    />

                    <div style={{ padding: '0 24px 24px', marginTop: '-20px' }}>
                        <Row gutter={[24, 24]} align="bottom">
                            <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <Avatar
                                        size={120}
                                        src={avatar}
                                        icon={<UserOutlined />}
                                        className="border-4 border-white shadow-md bg-slate-200"
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<CameraOutlined />}
                                        style={{ position: 'absolute', bottom: 5, right: 5 }}
                                        onClick={() => fileInputRef.current.click()}
                                    />
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                            </Col>
                            <Col xs={24} sm={18} md={20}>
                                <Title level={4} style={{ marginBottom: 0 }} className="text-center md:text-left block sm:text-left block">
                                    {data?.first_name} {data?.last_name}
                                </Title>
                                <Text className="text-center sm:text-left block" type="secondary">
                                    {user?.user_id_no}
                                </Text>
                            </Col>
                        </Row>
                    </div>
                </Card>

                <Row gutter={[24, 24]}>
                    {/* Details Column */}
                    <Col xs={24} lg={10}>
                        <Card title="Profile Information">
                            <Space direction="vertical">

                                <Space><UserOutlined /> {data?.gender || "-"}</Space>
                                <Space><CalendarOutlined /> {data?.birthday || "-"}</Space>
                                <Space><MailOutlined /> {data?.email_address || "-"}</Space>
                                <Space><PhoneOutlined /> {data?.contact_number || "-"}</Space>
                                <Space><EnvironmentOutlined /> {data?.present_address || "-"}</Space>

                            </Space>
                        </Card>

                        {user?.user_role !== "admin" && (
                            <Alert
                                type="info"
                                message="Need to update your information?"
                                description="For security reasons, changes to your profile must be verified. Please contact your administrator to request updates or corrections to your details."
                                showIcon
                                style={{ marginTop: 24 }}
                            />
                        )}

                    </Col>


                    {/* Security Column */}
                    <Col xs={24} lg={14}>
                        <Collapse>
                            <Panel
                                header={<Text strong>Change Password</Text>}
                                key="1"
                            >
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={onFinishPassword}
                                    requiredMark={false}
                                >
                                    <Form.Item
                                        name="newPassword"
                                        label="New Password"
                                        rules={[{ required: true, message: 'Please enter a new password' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        dependencies={['newPassword']}
                                        rules={[
                                            { required: true, message: 'Please confirm your password' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Passwords do not match!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" loading={loadingPassword} block>
                                        Update Password
                                    </Button>
                                </Form>



                            </Panel>
                        </Collapse>

                        <Divider />

                        <Button
                            danger
                            block
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            size="large"
                        >
                            Sign Out
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Crop Modal */}
            <Modal
                title="Adjust Profile Photo"
                open={showCropModal}
                onOk={handleCropSave}
                confirmLoading={isUploading}
                onCancel={() => setShowCropModal(false)}
                okText="Save Photo"
                destroyOnClose
            >
                <div style={{ position: 'relative', width: '100%', height: 300, background: '#f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Zoom</Text>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(val) => setZoom(val)}
                    />
                </div>
            </Modal>
        </AppLayout>
    );
}