import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    InputNumber,
    Button,
    Row,
    Col,
    Divider,
} from "antd";
import dayjs from "dayjs";

export default function EClearanceCreate({
    school_structure,
    onSuccess,
}) {
    const [form] = Form.useForm();
    const [processing, setProcessing] = useState(false);


    useEffect(() => {
        if (!school_structure?.school_years?.length) return;

        const last = school_structure.school_years.slice(-1)[0];

        form.setFieldsValue({
            school_year_id: last.id,
        });

    }, [school_structure, form]);

    const handleSubmit = async (values) => {
        setProcessing(true);

        const payload = {
            ...values,
            school_year_id: Number(values.school_year_id),
        };

        const promise = axios.post("/store/e-clearance", payload);

        toast.promise(promise, {
            loading: "Creating e-clearance...",
            success: "e-Clearance created successfully!",
            error: "Failed to create e-clearance",
        });

        try {
            await promise;
            onSuccess?.();
            form.resetFields();
        } catch (err) {
            if (err.response?.status === 422) {
                console.log("Validation Errors:", err.response.data.errors);
                toast.error("Validation failed. Check console.");
            } else {
                toast.error("Something went wrong.");
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
        >

            <Form.Item
                name="school_year_id"
                rules={[{ required: true }]}
            >
                <Select
                    options={school_structure?.school_years?.map(y => ({
                        value: y.id,
                        label: `A.Y. ${y.start_year}-${y.end_year} | ${y.semester.semester_name} Semester`
                    }))}
                />
            </Form.Item>

            <Button
                type="primary"
                htmlType="submit"
                loading={processing}
                block
            >
                Create
            </Button>
        </Form>
    );
}