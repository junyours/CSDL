import { useEffect, useState } from "react";
import axios from "axios";
import {
    Drawer,
    Spin,
    Tabs,
    Space,
    Avatar,
    Typography,
    Form,
    Select,
    List,
    Tag,
    message,
} from "antd";
import {
    FileOutlined,
    UserOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { theme } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Show({ open, onClose, clubId, setClubs }) {
    const { token } = theme.useToken();

    const [selectedClub, setSelectedClub] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [form] = Form.useForm();

    // 🔥 FETCH CLUB WHEN OPEN
    useEffect(() => {
        if (!clubId || !open) return;

        const fetchClub = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/manage-clubs/${clubId}`);
                setSelectedClub(res.data);

                form.setFieldsValue({
                    status: res.data.status,
                });
            } catch {
                message.error("Failed to load club details");
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [clubId, open]);

    // 🔥 UPDATE STATUS
    const handleStatusChange = async (value) => {
        setUpdating(true);

        try {
            await axios.put(`/manage-clubs/${selectedClub.id}`, {
                status: value,
            });

            message.success("Status updated");

            setSelectedClub((prev) => ({
                ...prev,
                status: value,
            }));

            // update parent cards
            setClubs((prev) =>
                prev.map((club) =>
                    club.id === selectedClub.id
                        ? { ...club, status: value }
                        : club
                )
            );

        } catch {
            message.error("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    const total = selectedClub?.members_count || 0;
    const shown = selectedClub?.members?.length || 0;
    const remaining = total - shown;

    return (
        <Drawer
            title={selectedClub ? selectedClub.club_name : "Club Details"}
            placement="right"
            width={420}
            onClose={onClose}
            open={open}
        >
            <Spin spinning={loading || updating}>
                {selectedClub && (
                    <Tabs defaultActiveKey="1">

                        {/* DETAILS */}
                        <Tabs.TabPane tab="Details" key="1">
                            <Space direction="vertical" style={{ width: "100%" }}>

                                <div style={{ textAlign: "center" }}>
                                    <Avatar
                                        size={120}
                                        src={
                                            selectedClub.club_logo_path
                                                ? `https://lh3.googleusercontent.com/d/${selectedClub.club_logo_path}`
                                                : null
                                        }
                                    />
                                    <Title level={4} style={{ marginTop: 12 }}>
                                        {selectedClub.club_name}
                                    </Title>
                                </div>

                                <Form layout="vertical" form={form}>
                                    <Form.Item name="status" rules={[{ required: true }]}>
                                        <Select
                                            onChange={handleStatusChange}
                                            loading={updating}
                                        >
                                            <Option value="Activated">Activated</Option>
                                            <Option value="Deactivated">Deactivated</Option>
                                        </Select>
                                    </Form.Item>
                                </Form>

                            </Space>
                        </Tabs.TabPane>

                        {/* MEMBERS */}
                        <Tabs.TabPane
                            tab={`Members (${selectedClub.members_count || 0})`}
                            key="2"
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={selectedClub.members || []}
                                renderItem={(member) => (
                                    <List.Item>
                                        <a
                                            href={`/manage-user/${member.user_id}/show`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "flex",
                                                width: "100%",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        src={
                                                            member.profile_photo
                                                                ? `https://lh3.googleusercontent.com/d/${member.profile_photo}`
                                                                : null
                                                        }
                                                    >
                                                        {!member.profile_photo &&
                                                            (member.name
                                                                ? member.name.charAt(0).toUpperCase()
                                                                : <UserOutlined />)}
                                                    </Avatar>
                                                }
                                                title={member.user_id_no}
                                                description={
                                                    <Space>
                                                        <Tag>{member.position}</Tag>
                                                        {member.is_admin && <Tag color="blue">Admin</Tag>}
                                                    </Space>
                                                }
                                            />
                                            <RightOutlined />
                                        </a>
                                    </List.Item>
                                )}
                                footer={
                                    remaining > 0 && (
                                        <Text type="secondary">
                                            +{remaining} more members
                                        </Text>
                                    )
                                }
                            />
                        </Tabs.TabPane>

                        {/* FILES */}
                        <Tabs.TabPane tab="Files" key="3">
                            <List
                                bordered
                                dataSource={[
                                    {
                                        name: "CBL File",
                                        file: selectedClub.club_cbl_file_path,
                                    },
                                ]}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() =>
                                            window.open(
                                                `https://drive.google.com/file/d/${item.file}/preview`,
                                                "_blank"
                                            )
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <List.Item.Meta
                                            avatar={<FileOutlined />}
                                            title={item.name}
                                            description="Click to preview"
                                        />
                                    </List.Item>
                                )}
                            />
                        </Tabs.TabPane>

                    </Tabs>
                )}
            </Spin>
        </Drawer>
    );
}