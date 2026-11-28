import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  onScan: (code: string) => void;
}

// Opens the camera and reads a QR code. The camera closes after the first code it reads.
// Browsers only open the camera on https or on localhost.
export function QrScannerBox({ onScan }: Readonly<Props>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callback without restarting the camera
  const callback = useRef(onScan);
  useEffect(() => {
    callback.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const video = videoRef.current;
    if (!scanning || !video) {
      return;
    }
    const scanner = new QrScanner(
      video,
      (result) => {
        setScanning(false);
        callback.current(result.data);
      },
      { preferredCamera: 'environment', highlightScanRegion: true, maxScansPerSecond: 5 },
    );
    scanner.start().catch(() => {
      setError('Could not open the camera. Allow camera access, or type the code below.');
      setScanning(false);
    });
    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [scanning]);

  function start() {
    setError(null);
    setScanning(true);
  }

  return (
    <div className="space-y-3">
      {scanning && (
        <div className="relative overflow-hidden rounded-xl bg-slate-900">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
        </div>
      )}
      {scanning ? (
        <Button variant="secondary" onClick={() => setScanning(false)} className="w-full">
          <CameraOff className="size-4" /> Stop camera
        </Button>
      ) : (
        <Button variant="secondary" onClick={start} className="w-full">
          <Camera className="size-4" /> Scan QR code with camera
        </Button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
