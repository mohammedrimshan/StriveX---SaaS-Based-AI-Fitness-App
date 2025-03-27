// ImageCropper.tsx (unchanged from last version, included for reference)
import React, { useRef, useState, useEffect } from "react";
import ReactCrop, { Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { AspectRatioType } from "@/hooks/ui/imageFilter";

interface ImageCropperProps {
  image: string;
  aspectRatio: AspectRatioType;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  aspectRatio,
  onCropComplete,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgWidth(naturalWidth);
    setImgHeight(naturalHeight);

    updateCrop(aspectRatio, naturalWidth, naturalHeight);
  };

  const updateCrop = (ratio: AspectRatioType, width: number, height: number) => {
    let initialCrop;
    if (ratio.value) {
      initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          ratio.value,
          width,
          height
        ),
        width,
        height
      );
    } else {
      initialCrop = {
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      };
    }
    setCrop(initialCrop);
    setCompletedCrop({
      x: (initialCrop.x / 100) * width,
      y: (initialCrop.y / 100) * height,
      width: (initialCrop.width / 100) * width,
      height: (initialCrop.height / 100) * height,
      unit: 'px'
    });
  };

  useEffect(() => {
    if (!imgRef.current || !imgWidth || !imgHeight) return;
    updateCrop(aspectRatio, imgWidth, imgHeight);
  }, [aspectRatio, imgWidth, imgHeight]);

  useEffect(() => {
    if (!completedCrop || !imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      img,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg");
    onCropComplete(dataUrl);
  }, [completedCrop, onCropComplete]);

  return (
    <div className="relative w-full">
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={aspectRatio.value || undefined}
        className="max-h-[40vh] w-full"
      >
        <img
          ref={imgRef}
          src={image}
          alt="Crop preview"
          onLoad={onImageLoad}
          className="max-h-[40vh] w-full object-contain"
        />
      </ReactCrop>
    </div>
  );
};

export default ImageCropper;