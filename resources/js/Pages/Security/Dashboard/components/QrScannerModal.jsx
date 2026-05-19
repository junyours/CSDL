import { Modal, Spin } from "antd";
import QrScanner from "./QrScanner";

export default function QrScannerModal({ open, onClose, onResult, loading }) {
    return (
        <Modal
            title="Scan QR Code"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Spin spinning={loading}>
                <QrScanner
                    active={open}
                    onResult={async (id) => {
                        await onResult(id);
                        onClose();
                    }}
                />
            </Spin>
        </Modal>
    );
}