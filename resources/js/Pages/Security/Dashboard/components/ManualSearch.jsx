import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { isValidStudentId } from "../../../../utils/validator";

export default function ManualSearch({ value, onChange, onSubmit }) {
    const isValid = isValidStudentId(value);

    return (
        <Space.Compact style={{ width: "100%" }}>
            <Input
                placeholder="0000-0-00000"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPressEnter={onSubmit}
            />

            <Button
                type="primary"
                icon={<SearchOutlined />}
                disabled={!isValid}
                onClick={onSubmit}
            >
                Confirm
            </Button>
        </Space.Compact>
    );
}