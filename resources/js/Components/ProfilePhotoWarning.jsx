import React from 'react';
import { Card, Button, Typography, Alert, Space, theme as antdTheme } from 'antd';
import { AlertTriangle, ArrowRight, Info } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

const ProfilePhotoWarning = ({
    title = "Profile Photo Required",
    description = "To access your digital ID, violation records and other services, please upload a proper profile photo following the guidelines below.",
    onAction,
    actionText = "Go to Profile",
    imageReference = "/assets/images/proper-profile-photo.png"
}) => {
    const { token } = antdTheme.useToken();

    const guidelines = [
        "Plain white or light background",
        "Face clearly visible and centered",
        "No filters or heavy editing",
        "No sunglasses, caps, or obstructions"
    ];

    return (
        <Card
            className="max-w-2xl mx-auto shadow-sm"
            style={{ borderRadius: '12px' }}
        >
            <div className="flex flex-col items-center text-center">
                {/* Icon Header */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: token.colorWarningBg }}
                >
                    <AlertTriangle size={32} color={token.colorWarning} />
                </div>

                <Title level={4}>{title}</Title>

                <Paragraph type="secondary" >
                    {description}
                </Paragraph>

                {/* Guidelines Section */}
                <div className="w-full text-left bg-transparent border-0 mt-4">
                    <Title level={5}>
                        <Space>
                            <Info size={16} />
                            Requirements:
                        </Space>
                    </Title>
                    <ul style={{ color: token.colorTextDescription, paddingLeft: '20px' }}>
                        {guidelines.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Image Reference */}
                <div className="mt-6 p-4 rounded-lg" style={{ background: token.colorFillAlter }}>
                    <Text strong block className="mb-4">Reference Example</Text>
                    <img
                        src={imageReference}
                        alt="Proper Example"
                        className="w-40 h-40 object-cover shadow-sm mt-4"
                        style={{
                            border: `2px solid ${token.colorBorder}`
                        }}
                    />
                </div>

                {/* Critical Notice */}
                <Alert
                    className="mt-8 w-full text-left"
                    message="Important Notice"
                    description={
                        <span>
                            Failure to follow the profile photo guidelines may result in
                            <Text strong underline type="danger"> automatic account deactivation</Text>.
                        </span>
                    }
                    type="error"
                    showIcon
                />

                {/* Action Button */}
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRight size={18} />}
                    iconPosition="end"
                    className="mt-8 px-8"
                    onClick={onAction}
                    style={{ height: '45px', borderRadius: '8px' }}
                >
                    {actionText}
                </Button>
            </div>
        </Card>
    );
};

export default ProfilePhotoWarning;