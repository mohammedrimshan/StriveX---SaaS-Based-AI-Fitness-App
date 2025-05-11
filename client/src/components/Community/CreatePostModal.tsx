"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import UserAvatar from "./UserAvatar"
import CategoryBadge from "./CategoryBadge"
import { ImageIcon, SendHorizonal, X } from "lucide-react"
import { useCreatePost } from "@/hooks/community/useCommunity"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/userSelectors"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "./index"

interface CreatePostModalProps {
  onPostCreated: (content: string, imageFile?: File) => void
}

const CreatePostModal = ({ onPostCreated }: CreatePostModalProps) => {
  const currentUser = useSelector(selectCurrentUser) as User | null
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const createPostMutation = useCreatePost()

  const category = currentUser
    ? currentUser.isTrainer
      ? currentUser.specialization || "General"
      : currentUser.preferredWorkout || "General"
    : "General"

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = () => {
    if (!content.trim() || !currentUser) return

    setIsSubmitting(true)
    const createPost = async () => {
      let media: string | undefined
      if (imageFile) {
        const reader = new FileReader()
        media = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
      }
      
      createPostMutation.mutate(
        { 
          textContent: content.trim(), 
          media, 
          category,
          role: currentUser.isTrainer ? "trainer" : "client"
        },
        {
          onSuccess: () => {
            onPostCreated(content, imageFile || undefined)
            setContent("")
            setImageFile(null)
            setImagePreview(null)
            setIsSubmitting(false)
            setIsOpen(false)
          },
          onError: (error: Error) => {
            console.error("Create Post Error:", error.message)
            setIsSubmitting(false)
          },
        }
      )
    }
    createPost()
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-medium hover:opacity-90 shadow-lg shadow-violet-500/20 border-0">
            <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Create Post
            </motion.span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-slate-200 shadow-xl shadow-violet-900/20">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create a post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center space-x-3">
            <UserAvatar user={currentUser} size="sm" />
            <div>
              <p className="font-medium text-sm text-slate-100">{currentUser.name}</p>
              <div className="flex items-center space-x-2">
                {category && <CategoryBadge category={category} isTrainer={currentUser.isTrainer} />}
                <span className="text-xs text-slate-400">Public post</span>
              </div>
            </div>
          </div>

          <div>
            <Textarea
              placeholder="What's on your fitness mind?"
              className="resize-none min-h-[150px] bg-slate-800/90 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-violet-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <AnimatePresence>
            {imagePreview && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto rounded-md max-h-[200px] object-cover border border-slate-700"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={removeImage}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <motion.div
                  className="flex items-center space-x-2 text-slate-400 hover:text-slate-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Add image</span>
                </motion.div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </Label>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
              >
                {isSubmitting ? (
                  "Posting..."
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePostModal