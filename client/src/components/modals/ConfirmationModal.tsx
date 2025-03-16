import { useState, useEffect } from "react";
import {
  X,
  LogOut,
  CheckCircle,
  TriangleAlert,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDarkMode?: boolean;
  icon?: "success" | "danger" | "logout" | "warning";
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDarkMode = true,
  icon = "success",
}: ConfirmationModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const iconMap = {
    success: CheckCircle,
    danger: AlertCircle,
    warning: TriangleAlert,
    logout: LogOut,
  };
  
  const iconColors = {
    success: "text-green-500",
    danger: "text-red-500",
    warning: "text-amber-500",
    logout: "text-violet-500",
  };

  const buttonColors = {
    success: "bg-green-500 hover:bg-green-600",
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    logout: "bg-violet-500 hover:bg-violet-600",
  };

  const Icon = icon ? iconMap[icon] : null;
  const iconColor = icon ? iconColors[icon] : "text-violet-500";
  const buttonColor = icon ? buttonColors[icon] : "bg-violet-500 hover:bg-violet-600";

  if (!isOpen && !isAnimating) return null;

  return (
    <AnimatePresence>
      {(isOpen || isAnimating) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${
              isDarkMode ? "bg-black/70" : "bg-black/30"
            } backdrop-blur-sm`}
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className={`${
              isDarkMode 
                ? "bg-gray-900 text-white border border-gray-700" 
                : "bg-white text-gray-900 border border-gray-200"
            } rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden`}
          >
            {/* Decorative top border */}
            <div className={`h-1 w-full ${icon === "logout" ? "bg-violet-500" : `bg-${icon === "success" ? "green" : icon === "danger" ? "red" : "amber"}-500`}`} />
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                {Icon && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} p-2 mr-4`}
                  >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </motion.div>
                )}
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-semibold"
                >
                  {title}
                </motion.h2>
              </div>
              
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } mb-6 leading-relaxed`}
              >
                {description}
              </motion.p>
              
              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } font-medium`}
                  onClick={handleClose}
                >
                  {cancelText}
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${buttonColor} font-medium`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
            
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
              }}
              className={`absolute right-4 top-4 rounded-full p-1 ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              } transition-colors`}
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;