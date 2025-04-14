"use client";

import { useState, useEffect } from "react";
import CropperModal from "./ImageCropper";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { ProfileImageUploaderProps } from "@/types/Response";


export default function ProfileImageUploader({ initialImage, onCropComplete }: ProfileImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(initialImage || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setCroppedImage(initialImage || null);
  }, [initialImage]);

  const validateImage = async (file: File): Promise<boolean> => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPG, PNG, WebP, or GIF.");
      return false;
    }

    if (file.size > maxSizeInBytes) {
      toast.error("File too large. Maximum size is 5MB.");
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImage(file);
    if (!isValid) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string | null) => {
    setCroppedImage(croppedImageUrl);
    setIsModalOpen(false);
    onCropComplete(croppedImageUrl);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCroppedImage(null);
    onCropComplete(null);
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("profile-upload")?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 👇 Hidden File Input */}
      <input
        id="profile-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <div
          className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${
            croppedImage ? "animated-gradient-border" : "bg-secondary/30"
          }`}
          onClick={triggerFileInput}
        >
          {croppedImage ? (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              src={croppedImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.05, 1],
                transition: { duration: 3, repeat: Infinity },
              }}
              className="bg-gradient-to-r from-violet/20 to-accent/20 w-full h-full flex items-center justify-center"
            >
              <Camera className="w-16 h-16 text-violet" />
            </motion.div>
          )}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet/60 to-accent/60 flex items-center justify-center rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
                transition: { repeat: Infinity, duration: 1.5 },
              }}
            >
              <Camera className="text-white h-8 w-8" />
            </motion.div>
          </motion.div>
        </div>
        {croppedImage && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-destructive to-accent text-white p-1 rounded-full hover:opacity-90 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>

      <Button
        type="button"
        variant="outline"
        onClick={triggerFileInput}
        className="text-sm font-medium transition-all hover:bg-secondary/30 border-violet/50 hover:border-accent/80 bg-gradient-to-r from-violet/10 to-accent/10"
      >
        {croppedImage ? "Change Photo" : "Upload Photo"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Recommended: Square JPG, PNG, WebP, or GIF, max 5MB
      </p>

      {image && (
        <CropperModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          image={image}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  );
}