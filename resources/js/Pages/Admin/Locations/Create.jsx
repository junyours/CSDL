import { useState } from "react";
import MapDraw from "../../../Components/MapDraw";
import axios from "axios";

import {
    Form,
    Input,
    Button,
    Upload,
    Switch,
    message,
    Card,
    Alert,
    Divider,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";

export default function Create({ onClose, onCreated }) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [fileList, setFileList] = useState([]);

    const handleSubmit = async (values) => {
        if (!polygonPoints || polygonPoints.length < 3) {
            form.setFields([
                {
                    name: "polygon_points",
                    errors: ["A polygon must have at least 3 points."],
                },
            ]);
            return;
        }

        setProcessing(true);

        try {
            const fd = new FormData();

            fd.append("location_name", values.location_name);
            fd.append("address", values.address);
            fd.append("status", values.status ? 1 : 0);
            fd.append("polygon_points", JSON.stringify(polygonPoints));

            if (fileList.length > 0) {
                fd.append("location_photo", fileList[0].originFileObj);
            }

            const res = await axios.post("/setup/location/store", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            message.success("Location created successfully!");

            if (res?.data?.data) {
                onCreated?.(res.data.data);
            } else {
                onCreated?.(res.data);
            }

            form.resetFields();
            setPolygonPoints([]);
            setFileList([]);

            onClose?.();

        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors;

                const formatted = Object.keys(serverErrors).map((key) => ({
                    name: key,
                    errors: [serverErrors[key][0]],
                }));

                form.setFields(formatted);
            } else {
                message.error("Failed to create location");
                console.error(err);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                status: true,
            }}
        >
            {/* LOCATION NAME */}
            <Form.Item
                label="Location Name"
                name="location_name"
                rules={[{ required: true, message: "Location name is required" }]}
            >
                <Input />
            </Form.Item>

            {/* ADDRESS */}
            <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Address is required" }]}
            >
                <Input />
            </Form.Item>

            {/* MAP DRAW */}
            <Form.Item
                label="Geofence Area"
                required
            >
                <Card size="small" bodyStyle={{ padding: 0 }}>
                    <MapDraw
                        initialPoints={[]}
                        onChange={(pts) => setPolygonPoints(pts)}
                    />
                </Card>

                <Form.Item name="polygon_points" noStyle>
                    <input type="hidden" />
                </Form.Item>
            </Form.Item>


            <Divider />


            {/* SUBMIT */}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={processing}
                    block
                >
                    Create Location
                </Button>
            </Form.Item>
        </Form>
    );
}