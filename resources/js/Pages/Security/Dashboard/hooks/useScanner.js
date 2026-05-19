import { useEffect, useRef, useState } from 'react';

export function useQrScanner({ enabled, onScan }) {
    const ref = useRef(null);
    const lastScanRef = useRef("");
    const scanLockRef = useRef(false);

    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');

    /* LOAD SCRIPT */
    useEffect(() => {
        if (window.Html5Qrcode) {
            setReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html5-qrcode/minified/html5-qrcode.min.js';
        script.async = true;

        script.onload = () => setReady(true);
        script.onerror = () => setError("Failed to load scanner.");

        document.body.appendChild(script);
    }, []);

    /* SCANNER */
    useEffect(() => {
        if (!enabled || !ready) return;

        let isMounted = true;

        const startScanner = async () => {
            const element = document.getElementById("qr-scanner");
            if (!element || ref.current) return;

            try {
                const qr = new window.Html5Qrcode("qr-scanner");
                ref.current = qr;

                await qr.start(
                    {
                        facingMode: { exact: "environment" } // 🔥 force back cam
                    },
                    {
                        fps: 20, // 🔥 faster scanning
                        qrbox: (w, h) => {
                            const size = Math.min(w, h);
                            return size * 0.45; // 🔥 smaller = faster
                        },
                        aspectRatio: 1.0,
                        disableFlip: false,
                        videoConstraints: {
                            facingMode: "environment",
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                    },
                    (decodedText) => {
                        if (!decodedText) return;

                        // 🔒 Prevent spam + duplicates
                        if (
                            scanLockRef.current ||
                            lastScanRef.current === decodedText
                        ) return;

                        scanLockRef.current = true;
                        lastScanRef.current = decodedText;

                        onScan(decodedText);

                        // unlock after short delay
                        setTimeout(() => {
                            scanLockRef.current = false;
                        }, 1200);
                    }
                );

            } catch (err) {
                if (isMounted) {
                    setError("Camera access denied or not supported.");
                }
            }
        };

        const timer = setTimeout(startScanner, 100); // 🔥 faster init

        return () => {
            isMounted = false;
            clearTimeout(timer);

            if (ref.current) {
                try {
                    ref.current.stop()?.catch(() => {});
                    ref.current.clear()?.catch(() => {});
                } catch {}

                ref.current = null;
            }
        };
    }, [enabled, ready, onScan]);

    return { error };
}