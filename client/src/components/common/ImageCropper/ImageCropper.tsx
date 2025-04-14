"use client";

import React, { useState } from "react";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CropperModalProps } from "@/types/Response";

const CropperModal: React.FC<CropperModalProps> = ({ 
  isOpen, 
  onClose, 
  image, 
  onCropComplete,
  aspectRatio = 1
}) => {
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCrop = () => {
    if (cropper) {
      setIsProcessing(true);
      
      try {
        const croppedCanvas = cropper.getCroppedCanvas({
          width: 300,
          height: 300,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        const croppedImageUrl = croppedCanvas.toDataURL("image/jpeg", 0.95);
        onCropComplete(croppedImageUrl);
        onClose();
      } catch (error) {
        console.error("Error cropping image:", error);
        onCropComplete(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl bg-card rounded-xl shadow-xl border border-violet/20 overflow-hidden animated-gradient-border"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-violet to-accent bg-opacity-10">
          <h3 className="text-lg font-semibold text-card-foreground">Crop Profile Image</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="bg-muted/20 rounded-lg overflow-hidden">
            <Cropper
              src={image}
              style={{ height: 400, width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              minCropBoxHeight={100}
              minCropBoxWidth={100}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              onInitialized={(instance) => {
                setCropper(instance);
              }}
              cropBoxMovable={true}
              cropBoxResizable={true}
              dragMode="move"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end space-x-3 bg-gradient-to-r from-accent/5 to-violet/5">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="font-medium border-violet/30 hover:border-violet/60"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            variant="default"
            className="bg-gradient-to-r from-violet to-accent hover:opacity-90 text-primary-foreground font-medium"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CropperModal;