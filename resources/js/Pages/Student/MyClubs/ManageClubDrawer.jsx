import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Drawer,
    Space,
    Avatar,
    Typography,
    List,
    Tag,
    Spin,
    message,
    Form,
    Input,
    Select,
    Button,
    Divider,
    Popover,
    Descriptions,
} from "antd";
import {
    FileOutlined,
    UserOutlined,
    RightOutlined,
    DeleteOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { theme } from "antd";
import debounce from "lodash.debounce";


import { Collapse } from "antd";
const { Panel } = Collapse;

const { Title, Text } = Typography;
const { Option } = Select;

export default function ManageClubDrawer({
    open,
    onClose,
    clubId,
    user,
}) {
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [club, setClub] = useState(null);

    const [requestingJoin, setRequestingJoin] = useState(false);

    useEffect(() => {
        if (!open || !clubId) return;
        fetchClub();
    }, [open, clubId]);

    const fetchClub = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/student/my-clubs/${clubId}`);
            setClub(res.data);
        } catch (err) {
            message.error("Failed to load club details");
        } finally {
            setLoading(false);
        }
    };

    /* =============================
       CHECK PERMISSIONS
    ============================== */
    const currentMember = club?.members?.find(
        (m) => m.user_id === user?.id
    );

    const isMember = !!currentMember;

    const isAdmin = !!currentMember?.is_admin;
    const isActivated = club?.status === "Activated";


    /* =============================
       ADD MEMBER
    ============================== */
    const handleAddMember = async (values) => {
        setSubmitting(true);
        try {
            await axios.post(`/student/my-clubs/${clubId}/add-member`, values);

            message.success("Member added successfully");
            form.resetFields();

            // refresh members
            fetchClub();
        } catch (err) {
            message.error(err?.response?.data?.message || "Failed to add member");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestJoin = async () => {

        setRequestingJoin(true);

        try {

            await axios.post(`/student/my-clubs/${clubId}/request-join`);

            message.success("Join request submitted");

            // SEMI REALTIME UI UPDATE
            setClub((prev) => ({
                ...prev,
                has_pending_request: true,
            }));

        } catch (err) {

            message.error(
                err?.response?.data?.message ||
                "Failed to request joining"
            );

        } finally {

            setRequestingJoin(false);
        }
    };

    const [search, setSearch] = useState("");
    const handleSearch = useMemo(
        () =>
            debounce((value) => {
                setSearch(value);
            }, 300),
        []
    );


    const filteredMembers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        let members = [...(club?.members || [])];

        // SEARCH FILTER
        if (keyword) {
            members = members.filter((member) =>
                (member.user_id_no || "").toLowerCase().includes(keyword) ||
                (member.position || "").toLowerCase().includes(keyword)
            );
        }

        // MOVE CURRENT USER TO TOP
        members.sort((a, b) => {
            if (a.user_id === user?.id) return -1;
            if (b.user_id === user?.id) return 1;
            return 0;
        });

        return members;
    }, [search, club?.members, user?.id]);

    const [studentInfo, setStudentInfo] = useState({});
    const [loadingStudent, setLoadingStudent] = useState(false);

    const fetchStudentInfo = async (userIdNo) => {
        // already fetched
        if (studentInfo[userIdNo]) return;

        setLoadingStudent(true);

        try {
            const res = await axios.get(
                `/student/student-information?user_id_no=${userIdNo}`
            );

            const student = res.data?.[0];

            setStudentInfo((prev) => ({
                ...prev,
                [userIdNo]: student,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStudent(false);
        }
    };

    const renderStudentPopover = (userIdNo) => {
        const student = studentInfo[userIdNo];

        if (!student) {
            return <Spin size="small" />;
        }

        return (
            <Space direction="vertical" size={2}>
                <Text>
                    {student.full_name || "N/A"}
                </Text>

                <Text type="secondary">
                    {
                        student?.current_enrollment?.year_section?.course?.course_name_abbreviation
                    }{" "}
                    -{" "}
                    {
                        student?.current_enrollment?.year_section?.year_level
                            ?.year_level
                    }{" "}
                    {
                        student?.current_enrollment?.year_section?.section
                    }
                </Text>
            </Space>
        );
    };

    return (
        <Drawer
            placement="right"
            width={500}
            open={open}
            onClose={onClose}
            destroyOnClose
        >
            <Spin spinning={loading}>
                {club && (
                    <Space direction="vertical" style={{ width: "100%" }} size="medium">

                        {/* CLUB INFO */}
                        <Space direction="vertical" align="center" style={{ width: "100%" }}>
                            <Avatar
                                size={100}
                                src={
                                    club.club_logo_path
                                        ? `https://lh3.googleusercontent.com/d/${club.club_logo_path}`
                                        : null
                                }
                            />
                            <Title level={5} style={{ margin: 0 }}>
                                {club.club_name}
                            </Title>
                            <Text type="secondary">
                                <Space>
                                    <Tag color={club.status === "Activated" ? "green" : club.status === "Deactivated" ? "red" : "orange"}>
                                        {club.status}
                                    </Tag>
                                    {club.members_count} members
                                </Space>
                            </Text>
                        </Space>

                        {/* FILE */}
                        <List
                            rowKey="id"
                            bordered
                            dataSource={[
                                {
                                    name: "CBL File",
                                    file: club.club_cbl_file_path,
                                },
                            ]}
                            renderItem={(item) => (
                                <List.Item
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        window.open(
                                            `https://drive.google.com/file/d/${item.file}/preview`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <List.Item.Meta
                                        avatar={<FileOutlined />}
                                        title={item.name}
                                        description="Click to preview document"
                                    />
                                </List.Item>
                            )}
                        />

                        {/* NOT MEMBER */}
                        {!isMember ? (
                            club?.has_pending_request ? (
                                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                                    <Button
                                        block
                                        disabled
                                        icon={<CheckOutlined />}
                                    >
                                        Join Request Sent
                                    </Button>

                                    <Text type="secondary">
                                        Waiting for club admin approval
                                    </Text>
                                </Space>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleRequestJoin}
                                    disabled={!isActivated}
                                    loading={requestingJoin}
                                >
                                    {requestingJoin ? "Submitting Request..." : "Request Join"}
                                </Button>
                            )
                        ) : (
                            <>
                                {/* ADD MEMBER */}
                                {isAdmin && isActivated && (
                                    <Collapse>
                                        <Panel
                                            header={<Text strong>Add Member</Text>}
                                            key="1"
                                        >
                                            <Form
                                                form={form}
                                                layout="vertical"
                                                onFinish={handleAddMember}
                                            >
                                                <Form.Item
                                                    name="user_id_no"
                                                    label="ID No"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item
                                                    name="position"
                                                    label="Position"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Select placeholder="Select position">
                                                        <Option value="member">Member</Option>
                                                        <Option value="president">President</Option>
                                                        <Option value="vice_president">Vice President</Option>
                                                        <Option value="secretary">Secretary</Option>
                                                        <Option value="treasurer">Treasurer</Option>
                                                        <Option value="auditor">Auditor</Option>
                                                        <Option value="club_coordinator">Club Coordinator</Option>
                                                    </Select>
                                                </Form.Item>

                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    block
                                                    loading={submitting}
                                                >
                                                    Add
                                                </Button>
                                            </Form>
                                        </Panel>
                                    </Collapse>
                                )}

                                {isAdmin && club?.join_requests?.length > 0 && (
                                    <div>
                                        <Divider>
                                            <Text strong>Join Requests</Text>
                                        </Divider>

                                        <List
                                            dataSource={club.join_requests}
                                            renderItem={(request) => {

                                                const handleApprove = async () => {
                                                    try {

                                                        await axios.put(
                                                            `/student/my-clubs/${clubId}/approve-request/${request.id}`
                                                        );

                                                        message.success("Request approved");

                                                        fetchClub();

                                                    } catch (err) {

                                                        message.error("Failed to approve request");
                                                    }
                                                };

                                                const handleReject = async () => {
                                                    try {

                                                        await axios.put(
                                                            `/student/my-clubs/${clubId}/reject-request/${request.id}`
                                                        );

                                                        message.success("Request rejected");

                                                        fetchClub();

                                                    } catch (err) {

                                                        message.error("Failed to reject request");
                                                    }
                                                };

                                                return (
                                                    <List.Item
                                                        actions={[
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                onClick={handleApprove}
                                                            >
                                                                Approve
                                                            </Button>,

                                                            <Button
                                                                danger
                                                                size="small"
                                                                onClick={handleReject}
                                                            >
                                                                Reject
                                                            </Button>
                                                        ]}
                                                    >
                                                        <Popover
                                                            trigger="click"
                                                            content={renderStudentPopover(request.user_id_no)}
                                                            onOpenChange={(open) => {
                                                                if (open) {
                                                                    fetchStudentInfo(request.user_id_no);
                                                                }
                                                            }}
                                                        >
                                                            <List.Item.Meta
                                                                avatar={
                                                                    <Avatar
                                                                        src={
                                                                            request.profile_photo
                                                                                ? `https://lh3.googleusercontent.com/d/${request.profile_photo}`
                                                                                : null
                                                                        }
                                                                        icon={<UserOutlined />}
                                                                    />
                                                                }

                                                                title={request.user_id_no}

                                                                description={`Requested ${request.updated_at}`}
                                                            />
                                                        </Popover>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    </div>
                                )}

                                {/* MEMBERS */}
                                <div>
                                    <Divider>
                                        <Text strong>Members</Text>
                                    </Divider>

                                    <Input.Search
                                        placeholder="Search members..."
                                        allowClear
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ marginBottom: 12 }}
                                    />

                                    <List
                                        itemLayout="horizontal"
                                        dataSource={filteredMembers}
                                        locale={{ emptyText: "No members found" }}
                                        renderItem={(member) => {
                                            const isSelf = member.user_id === user?.id;

                                            const handlePositionChange = async (memberId, value) => {
                                                try {
                                                    await axios.put(`/student/my-clubs/${clubId}/update-member/${memberId}`, {
                                                        position: value,
                                                    });

                                                    message.success("Position updated");
                                                    fetchClub();
                                                } catch {
                                                    message.error("Failed to update position");
                                                }
                                            };

                                            const handleRemove = async () => {
                                                try {
                                                    await axios.put(`/student/my-clubs/${clubId}/remove-member/${member.id}`);

                                                    message.success("Member removed");
                                                    fetchClub();
                                                } catch (err) {
                                                    message.error("Failed to remove member");
                                                }
                                            };

                                            return (
                                                <List.Item
                                                    style={{
                                                        padding: 12,
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            width: "100%",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            gap: 12,
                                                        }}
                                                    >
                                                        <Popover
                                                            trigger="click"
                                                            content={renderStudentPopover(member.user_id_no)}
                                                            onOpenChange={(open) => {
                                                                if (open) {
                                                                    fetchStudentInfo(member.user_id_no);
                                                                }
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
                                                                        icon={<UserOutlined />}
                                                                    />
                                                                }
                                                                title={isSelf ? "You" : member.user_id_no}
                                                                description={
                                                                    <Space wrap>
                                                                        {isAdmin && isActivated ? (
                                                                            <Select
                                                                                size="small"
                                                                                value={member.position}
                                                                                onChange={(value) => handlePositionChange(member.id, value)}
                                                                                style={{ minWidth: 140 }}
                                                                            >
                                                                                <Option value="member">Member</Option>
                                                                                <Option value="president">President</Option>
                                                                                <Option value="vice_president">Vice President</Option>
                                                                                <Option value="secretary">Secretary</Option>
                                                                                <Option value="treasurer">Treasurer</Option>
                                                                                <Option value="auditor">Auditor</Option>
                                                                                <Option value="club_coordinator">Coordinator</Option>
                                                                            </Select>
                                                                        ) : (
                                                                            <Tag
                                                                                color={member.position != "member" ? "gold" : "default"}
                                                                                style={{ textTransform: "capitalize" }}
                                                                            >
                                                                                {member.position}
                                                                            </Tag>
                                                                        )}

                                                                        {member.is_admin && (
                                                                            <Tag color="blue">Admin</Tag>
                                                                        )}
                                                                    </Space>
                                                                }
                                                            />

                                                        </Popover>

                                                        {isAdmin && isActivated && !isSelf && (
                                                            <Button
                                                                danger
                                                                size="small"
                                                                onClick={handleRemove}
                                                                icon={<DeleteOutlined />}
                                                            />
                                                        )}
                                                    </div>
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </Space>
                )}
            </Spin>
        </Drawer>
    );
}