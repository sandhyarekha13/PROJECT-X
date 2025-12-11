import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, Users, Clock, ArrowLeft } from 'lucide-react';

interface HeadCountProps {
    onBack: () => void;
}

const HeadCount: React.FC<HeadCountProps> = ({ onBack }) => {
    const webcamRef = useRef<Webcam>(null);
    const ipImageRef = useRef<HTMLImageElement>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState<number | null>(null);
    const [lastCaptureTime, setLastCaptureTime] = useState<string | null>(null);
    const [targetTime, setTargetTime] = useState(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    });
    const [isAutoCaptureEnabled, setIsAutoCaptureEnabled] = useState(true);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraType, setCameraType] = useState<'webcam' | 'ip'>('webcam');
    const [ipCameraUrl, setIpCameraUrl] = useState('');

    // Load the model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setLoading(false);
                console.log("Model loaded successfully");
            } catch (err) {
                console.error("Failed to load model", err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    const captureAndCount = useCallback(async () => {
        if (!model) return;

        let imageElement: HTMLImageElement | null = null;
        let imageSrc: string | null = null;

        if (cameraType === 'webcam' && webcamRef.current) {
            imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const img = new Image();
                img.src = imageSrc;
                await new Promise((resolve) => { img.onload = resolve; });
                imageElement = img;
            }
        } else if (cameraType === 'ip' && ipImageRef.current) {
            // For IP camera, we use the current image from the img tag
            // Note: This might face CORS issues if the camera doesn't allow it.
            // We create a new image to avoid modifying the live stream element
            imageElement = ipImageRef.current;
            imageSrc = ipImageRef.current.src;
        }

        if (!imageElement || !imageSrc) return;

        setCapturedImage(imageSrc);
        setLastCaptureTime(new Date().toLocaleTimeString());

        try {
            const predictions = await model.detect(imageElement);
            const personPredictions = predictions.filter(p => p.class === 'person');
            setCount(personPredictions.length);
        } catch (error) {
            console.error("Detection failed", error);
        }

    }, [model, cameraType]);

    // Auto-capture logic
    useEffect(() => {
        if (!isAutoCaptureEnabled) return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (currentTime === targetTime && now.getSeconds() === 0) {
                captureAndCount();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime, isAutoCaptureEnabled, captureAndCount]);

    return (
        <div className="head-count-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={onBack}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Users size={24} color="#818cf8" />
                        Student Head Count
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                            <select
                                value={cameraType}
                                onChange={(e) => setCameraType(e.target.value as 'webcam' | 'ip')}
                                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                <option value="webcam" style={{ color: 'black' }}>Webcam</option>
                                <option value="ip" style={{ color: 'black' }}>IP Camera</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="auto-capture-toggle"
                                checked={isAutoCaptureEnabled}
                                onChange={(e) => setIsAutoCaptureEnabled(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="auto-capture-toggle" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Auto</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                            <Clock size={16} />
                            <input
                                id="time-picker"
                                type="time"
                                value={targetTime}
                                onChange={(e) => setTargetTime(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'white', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>
                </div>

                {cameraType === 'ip' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Enter Camera Stream URL (e.g., http://192.168.1.100/video)"
                            value={ipCameraUrl}
                            onChange={(e) => setIpCameraUrl(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                        />
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading AI Model...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', background: '#000', minHeight: '300px' }}>
                            {cameraType === 'webcam' ? (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                    {ipCameraUrl ? (
                                        <img
                                            ref={ipImageRef}
                                            src={ipCameraUrl}
                                            alt="IP Camera Stream"
                                            crossOrigin="anonymous"
                                            style={{ maxWidth: '100%', maxHeight: '400px' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                // You might want to show an error message here
                                            }}
                                        />
                                    ) : (
                                        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Enter a valid IP Camera URL</div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={captureAndCount}
                                style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#818cf8',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                                }}
                            >
                                <Camera size={20} />
                                Capture Now
                            </button>
                        </div>

                        {capturedImage && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img src={capturedImage} alt="Captured" style={{ height: '100px', borderRadius: '0.25rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last captured at {lastCaptureTime}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                                        {count !== null ? `${count} Students Detected` : 'Analyzing...'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeadCount;
