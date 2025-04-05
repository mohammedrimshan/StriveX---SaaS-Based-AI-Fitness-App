"use client";

import React, { useState, useRef } from "react";
import { Camera, UserCircle2, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ImageEditor from "@/components/common/ImageCropper/ImageEditor";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clientLogin } from "@/store/slices/client.slice";
import { toast } from "react-hot-toast";

const ProfileImage: React.FC = () => {
  const dispatch = useDispatch();
  const client = useSelector((state: RootState) => state.client.client);
  console.log(client,"client...")
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image validation function
  const validateImage = (file: File): boolean => {
    // Allowed image mime types
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/gif'
    ];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        //description: "Only JPEG, PNG, WebP, and GIF images are allowed.",
        icon: <AlertTriangle className="text-destructive" />
      });
      return false;
    }

    // Check file size (5MB limit)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error("File too large", {
       // description: "Image must be less than 5MB.",
        icon: <AlertTriangle className="text-destructive" />
      });
      return false;
    }

    // Additional check to ensure it's a valid image
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => {
          toast.error("Invalid image", {
            //description: "The file is not a valid image.",
            icon: <AlertTriangle className="text-destructive" />
          });
          resolve(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }) as unknown as boolean;
  };

  const handleImageSubmit = (editedImage: string | null) => {
    if (client) {
      // Update the client's profile image in Redux
      dispatch(clientLogin({
        ...client,
        profileImage: editedImage || undefined
      }));
    }
    setShowEditor(false);
    setIsLoading(false);
    setSelectedImage(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    // Validate the file
    const isValidImage = await validateImage(file);
    
    if (!isValidImage) {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setShowEditor(true);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (client) {
      // Remove the profile image from Redux
      dispatch(clientLogin({
        ...client,
        profileImage: undefined
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <div
            className={cn(
              "w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300",
              !client?.profileImage && "bg-secondary",
              client?.profileImage ? "ring-4 ring-primary/20" : "ring-2 ring-border"
            )}
            onClick={triggerFileInput}
          >
            {isLoading ? (
              <div className="w-full h-full shimmer" />
            ) : client?.profileImage ? (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                src={client.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  transition: { duration: 5, repeat: Infinity },
                }}
              >
                <UserCircle2 className="w-20 h-20 text-muted-foreground" />
              </motion.div>
            )}
            <motion.div
              className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full"
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
          <AnimatePresence>
            {client?.profileImage && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            className="text-sm font-medium transition-all hover:bg-secondary"
          >
            {client?.profileImage ? "Change Photo" : "Upload Photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>
        <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG, WebP, or GIF, max 5MB</p>
      </motion.div>

      {showEditor && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <ImageEditor image={selectedImage} onSubmit={handleImageSubmit} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileImage;