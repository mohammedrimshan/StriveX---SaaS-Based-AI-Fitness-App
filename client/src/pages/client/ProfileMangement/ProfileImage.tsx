// "use client";

// import React, { useState, useRef } from "react";
// import { Camera, UserCircle2, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { motion, AnimatePresence } from "framer-motion";
// import CropperModal from "@/components/common/ImageCropper/ImageCropper";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store/store";
// import { clientLogin } from "@/store/slices/client.slice";
// import { toast } from "react-hot-toast";

// interface ProfileImageProps {
//   onImageChange: (image: string | undefined) => void;
//   initialImage?: string;
// }

// const ProfileImage: React.FC<ProfileImageProps> = ({ onImageChange, initialImage }) => {
//   const dispatch = useDispatch();
//   const client = useSelector((state: RootState) => state.client.client);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
//   const [showEditor, setShowEditor] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const validateImage = async (file: File): Promise<boolean> => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
//     const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

//     if (!allowedTypes.includes(file.type)) {
//       toast.error("Invalid file type");
//       return false;
//     }

//     if (file.size > maxSizeInBytes) {
//       toast.error("File too large");
//       return false;
//     }

//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const img = new Image();
//         img.onload = () => resolve(true);
//         img.onerror = () => {
//           toast.error("Invalid image");
//           resolve(false);
//         };
//         img.src = e.target?.result as string;
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleImageSubmit = (blob: Blob | null) => {
//     if (!blob) {
//       toast.error("Failed to process image");
//       setShowEditor(false);
//       setIsLoading(false);
//       setSelectedImage(null);
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const base64String = event.target?.result as string;
//       if (client) {
//         dispatch(
//           clientLogin({
//             ...client,
//             profileImage: base64String,
//           })
//         );
//       }
//       onImageChange(base64String);
//       setShowEditor(false);
//       setIsLoading(false);
//       setSelectedImage(null);
//     };
//     reader.readAsDataURL(blob);
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsLoading(true);
//     const isValidImage = await validateImage(file);

//     if (!isValidImage) {
//       setIsLoading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setSelectedImage(event.target?.result as string);
//       setShowEditor(true);
//       setIsLoading(false);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeImage = () => {
//     if (client) {
//       dispatch(
//         clientLogin({
//           ...client,
//           profileImage: undefined,
//         })
//       );
//     }
//     onImageChange(undefined);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const displayImage = initialImage || client?.profileImage;

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col items-center space-y-4"
//       >
//         <motion.div
//           className="relative"
//           onMouseEnter={() => setIsHovering(true)}
//           onMouseLeave={() => setIsHovering(false)}
//           whileHover={{ scale: 1.05 }}
//           transition={{ type: "spring", stiffness: 300, damping: 15 }}
//         >
//           <div
//             className={cn(
//               "w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300",
//               !displayImage && "bg-secondary",
//               displayImage ? "ring-4 ring-primary/20" : "ring-2 ring-border"
//             )}
//             onClick={triggerFileInput}
//           >
//             {isLoading ? (
//               <div className="w-full h-full shimmer" />
//             ) : displayImage ? (
//               <motion.img
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                 src={displayImage}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <motion.div
//                 animate={{
//                   rotate: [0, 10, 0, -10, 0],
//                   transition: { duration: 5, repeat: Infinity },
//                 }}
//               >
//                 <UserCircle2 className="w-20 h-20 text-muted-foreground" />
//               </motion.div>
//             )}
//             <motion.div
//               className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: isHovering ? 1 : 0 }}
//               transition={{ duration: 0.2 }}
//             >
//               <motion.div
//                 animate={{
//                   y: [0, -5, 0],
//                   transition: { repeat: Infinity, duration: 1.5 },
//                 }}
//               >
//                 <Camera className="text-white h-8 w-8" />
//               </motion.div>
//             </motion.div>
//           </div>
//           <AnimatePresence>
//             {displayImage && (
//               <motion.button
//                 initial={{ scale: 0, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 25 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeImage();
//                 }}
//                 className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90 transition-colors"
//                 aria-label="Remove image"
//               >
//                 <X className="h-4 w-4" />
//               </motion.button>
//             )}
//           </AnimatePresence>
//         </motion.div>
//         <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={triggerFileInput}
//             className="text-sm font-medium transition-all hover:bg-secondary"
//           >
//             {displayImage ? "Change Photo" : "Upload Photo"}
//           </Button>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/png, image/jpeg, image/webp, image/gif"
//             className="hidden"
//             onChange={handleFileChange}
//           />
//         </motion.div>
//         <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG, WebP, or GIF, max 5MB</p>
//       </motion.div>

//       {showEditor && selectedImage && (
//         <CropperModal
//           image={selectedImage}
//           isOpen={showEditor}
//           onClose={() => {
//             setShowEditor(false);
//             setSelectedImage(null);
//           }}
//           onCropComplete={handleImageSubmit}
//         />
//       )}
//     </>
//   );
// };

// export default ProfileImage