import { Drawer, Typography } from "antd";
import { useQrScanner } from '../hooks/useScanner';

const { Text } = Typography;

export default function QrScannerDrawer({ open, onClose, onScanSuccess }) {
    
    const { error } = useQrScanner({
        enabled: open,
        onScan: (decodedText) => {
            if (!decodedText) return;

            onScanSuccess(decodedText); //
            onClose(); // close scanner
        },
    });

    return (
        <Drawer
            placement="bottom"
            open={open}
            onClose={onClose}
            closable={false}
            forceRender
            style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
            <div style={{ padding: 16, textAlign: "center" }}>
                <Text strong>Scan QR Code</Text>
            </div>

            {/* Scanner View */}
            <div
                id="qr-scanner"
                style={{
                    width: "100%",
                }}
            />

            {/* Error */}
            {error && (
                <div style={{ textAlign: "center", padding: 8 }}>
                    <Text type="danger">{error}</Text>
                </div>
            )}
        </Drawer>
    );
}