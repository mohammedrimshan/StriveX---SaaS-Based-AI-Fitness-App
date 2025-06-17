"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import axios from "axios"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, SendHorizonal, Smile, Camera } from "lucide-react"
import { selectCurrentUser } from "@/store/userSelectors"
import { motion, AnimatePresence } from "framer-motion"
import { WORKOUT_TYPES, WorkoutType } from "@/types/Consts"
import { useSocket } from "@/context/socketContext"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
interface CreatePostFormProps {
  onSubmit: (post: { textContent: string; category: WorkoutType; mediaUrl?: string }) => void | Promise<void>;
  isLoading?: boolean;
}


const CreatePostForm: React.FC<CreatePostFormProps> = () => {
  const { socket } = useSocket()
  const [textContent, setTextContent] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const currentUser = useSelector(selectCurrentUser)
  const userCategory = 
    (currentUser?.preferredWorkout) || 
    (currentUser?.specialization) || 
    WORKOUT_TYPES[0] || 
    "General"

  const MAX_CHARS = 500

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node) && textContent.length === 0 && !imagePreview) {
        setIsExpanded(false)
      }

      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [textContent, imagePreview])

  useEffect(() => {
    setCharCount(textContent.length)
  }, [textContent])

  const getInitials = () => {
    if (!currentUser?.name) return "U"
    const [firstName, lastName] = currentUser.name.split(" ")
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const uploadToCloudinary = async (file: File, folder: string, resourceType: string): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "edusphere")
    formData.append("folder", folder)

    try {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "strivex"
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      return response.data.secure_url
    } catch (error: any) {
      console.error("Cloudinary upload error:", error.response?.data || error.message)
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB")
        return
      }

      setMediaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setIsExpanded(true)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMediaFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!textContent.trim() && !mediaFile) {
      toast.error("Please add text or an image to your post")
      return
    }
    if (!currentUser) {
      toast.error("Please log in to create a post")
      return
    }

    try {
      setIsSubmitting(true)
      let media: { type: string; url: string; name: string } | undefined
      
      if (mediaFile) {
        const mediaUrl = await uploadToCloudinary(
          mediaFile, 
          `community_post/${currentUser.id}`, 
          "image"
        )
        media = { type: "image", url: mediaUrl, name: mediaFile.name }
      }

      if (socket) {
        socket.emit("createPost", {
          senderId: currentUser.id,
          textContent: textContent.trim(),
          media,
          category: userCategory,
          role: currentUser.role,
        })
      } else {
        toast.error("Socket connection not available. Please try again later.")
        return
      }

      toast.success("Post created successfully!")
      setTextContent("")
      setMediaFile(null)
      setImagePreview(null)
      setIsExpanded(false)
      setShowEmojiPicker(false)
    } catch (error) {
      toast.error("Failed to create post")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextareaFocus = () => {
    setIsExpanded(true)
    if (textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev)
  }

  const handleEmojiSelect = (emoji: { native: string }) => {
    const newText = textContent + emoji.native
    if (newText.length <= MAX_CHARS) {
      setTextContent(newText)
    }
    // Keep focus on textarea after selecting emoji
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="mb-6 relative">
      <motion.div 
        className={`border rounded-xl shadow-sm overflow-hidden bg-white transition-all duration-300 ${isExpanded ? "shadow-md" : ""}`}
        animate={{ 
          scale: isExpanded ? 1 : 0.99,
          opacity: 1
        }}
        initial={{ scale: 0.99, opacity: 0.9 }}
        whileHover={{ scale: 1, opacity: 1 }}
        ref={formRef}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex p-4 items-start">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Avatar className="h-12 w-12 border-2 border-gray-100 shadow-sm">
                {currentUser?.avatarUrl ? (
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </motion.div>
            
            <div className="flex-1 ml-3">
              <div 
                className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "bg-white" : "bg-gray-50"}`}
                onClick={handleTextareaFocus}
              >
                <Textarea
                  value={textContent}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setTextContent(e.target.value)
                    }
                  }}
                  placeholder={`What's on your fitness journey, ${currentUser?.name?.split(" ")[0] || "User"}?`}
                  className={`min-h-[40px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-sm ${isExpanded ? "min-h-[120px]" : ""}`}
                  disabled={isSubmitting}
                  onFocus={() => setIsExpanded(true)}
                  ref={textareaRef}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {imagePreview && (
              <motion.div
                className="px-4 pb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <motion.img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-[300px] object-cover"
                    initial={{ scale: 0.95, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.button
                    type="button"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 hover:bg-black text-white shadow-md flex items-center justify-center"
                    onClick={removeImage}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="flex justify-between items-center p-4 border-t border-gray-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.button
                    type="button"
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    onClick={triggerImageUpload}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                  </motion.button>

                  <div className="relative">
                    <motion.button
                      type="button"
                      className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      onClick={toggleEmojiPicker}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Smile className="h-5 w-5" />
                    </motion.button>

                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div 
                          className="absolute bottom-12 left-0 z-10" 
                          ref={emojiPickerRef}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="shadow-lg rounded-lg overflow-hidden">
                            <Picker 
                              data={data} 
                              onEmojiSelect={handleEmojiSelect}
                              theme="light"
                              previewPosition="none"
                              skinTonePosition="none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {textContent.length > 0 && (
                    <motion.div 
                      className={`text-xs ${charCount > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {charCount}/{MAX_CHARS}
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={(!textContent.trim() && !mediaFile) || !currentUser || isSubmitting}
                    className={`px-5 py-2.5 rounded-full shadow-sm flex items-center space-x-2 ${(!textContent.trim() && !mediaFile) || !currentUser || isSubmitting ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>{isSubmitting ? "Posting..." : "Post"}</span>
                    {!isSubmitting && <SendHorizonal className="h-4 w-4" />}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  )
}

export default CreatePostForm