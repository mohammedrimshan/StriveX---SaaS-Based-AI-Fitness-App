import React, { useState, useCallback, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropDialogProps {
  isOpen: boolean;
  uploadedImage: string | null;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
}

const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  isOpen,
  uploadedImage,
  onClose,
  onCrop,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, 16 / 9, width, height),
        width,
        height
      );
      setCrop(crop);
      setCompletedCrop(crop);
      imgRef.current = e.currentTarget;
    },
    []
  );

  const getCroppedImg = async () => {
    if (!imgRef.current || !completedCrop) {
      console.log("No image ref or completed crop available.");
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get canvas context.");
      return;
    }

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL("image/jpeg");
    const blob = await (await fetch(base64Image)).blob();
    const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
    onCrop(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5 text-purple-600" />
            Crop Workout Image
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {uploadedImage && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9}
            >
              <img
                src={uploadedImage}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", width: "100%" }}
              />
            </ReactCrop>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-red-100 hover:bg-red-50 hover:text-red-700"
            >
              Cancel
            </Button>
            <Button
              onClick={getCroppedImg}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
              disabled={!completedCrop}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;