"use client";
import { useRef, useState, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography
} from '@mui/material';

export default function BarcodeScanner() {
    const [open, setOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scannedResult, setScannedResult] = useState('');
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize Quagga only when the dialog is open & scanning is true
        if (open && scanning) {
            initQuagga();
        }
        // Cleanup on unmount or when we stop scanning
        return () => {
            Quagga.stop();
            Quagga.offDetected(onDetected); // remove any handlers
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, scanning]);

    const initQuagga = () => {
        if (!scannerRef.current) return;

        Quagga.init(
            {
                inputStream: {
                    name: 'Live',
                    type: 'LiveStream',
                    target: scannerRef.current, // Pass the DOM element where the camera feed will be shown
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment', // Try to use the rear camera
                    },
                    singleChannel: false
                },
                decoder: {
                    // List of active barcode formats:
                    readers: [
                        // 'code_128_reader',
                        'ean_reader',
                        // 'ean_8_reader',
                        'upc_reader',
                        // 'upc_e_reader',
                    ],
                },
            },
            (err) => {
                if (err) {
                    console.error('Quagga init error:', err);
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected(onDetected);
    };

    const onDetected = (data) => {
        // data.codeResult.code is the detected barcode value
        setScannedResult(data.codeResult.code);
        // Optionally, stop scanning after a successful read:
        Quagga.stop();
        setScanning(false);
    };

    const handleOpenDialog = () => {
        setOpen(true);
        // We won't start scanning until user explicitly clicks "Start Scanning"
        // but you could also auto-start scanning here if you prefer
        setScannedResult('');
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setScanning(false);
    };

    const handleToggleScanning = () => {
        if (scanning) {
            // Stop scanning
            Quagga.stop();
            setScanning(false);
        } else {
            // Start scanning
            setScannedResult('');
            setScanning(true);
        }
    };

    return (
        <>
            <Button variant="contained" onClick={handleOpenDialog}>
                Open Scanner
            </Button>

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Scan a Barcode</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={2}>
                        Click "Start Scanning" to access your camera and detect barcodes.
                    </Typography>

                    <div
                        ref={scannerRef}
                        style={{
                            width: '100%',
                            height: 400,
                            background: '#ccc', // fallback background
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    />

                    {scannedResult && (
                        <Typography variant="h6" mt={2} color="secondary">
                            Scanned result: {scannedResult}
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleToggleScanning}
                        sx={{ mt: 2 }}
                    >
                        {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}