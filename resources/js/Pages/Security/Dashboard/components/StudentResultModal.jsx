import { Modal, Avatar, Typography, Spin, Alert, Button, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function StudentResultModal({
    open,
    onClose,
    student,
    loading,
    error,
}) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <Spin spinning={loading}>
                {error && (
                    <Alert
                        type="error"
                        message="User not found"
                        description={error}
                        showIcon
                    />
                )}

                {student && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <Avatar
                                size={80}
                                src={student.avatar}
                                icon={<UserOutlined />}
                            />

                            <Title level={4} style={{ marginTop: 10 }}>
                                {student.last_name}
                            </Title>

                            <Text>
                                {student.first_name} {student.middle_name}
                            </Text>

                            <div>
                                <Tag>{student.user_id_no}</Tag>
                            </div>
                        </div>

                        <Button type="primary" block>
                            Issue Violation
                        </Button>
                    </>
                )}
            </Spin>
        </Modal>
    );
}