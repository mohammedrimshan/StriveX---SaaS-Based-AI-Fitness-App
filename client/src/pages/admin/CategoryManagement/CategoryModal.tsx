"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Info, CheckCircle } from "lucide-react";
import * as yup from "yup";
import { useToaster } from "@/hooks/ui/useToaster";
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2"
        >
          <div className="bg-zinc-800 text-zinc-200 text-xs rounded-md px-3 py-2 shadow-2xl border border-zinc-700">
            {content}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Define validation schema with yup
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .trim(),
  description: yup
    .string()
    .max(200, "Description must be less than 200 characters")
    .nullable()
    .transform((value) => (value === "" ? null : value))
});

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  editMode: boolean;
  initialValues?: { name: string; description: string };
}

interface ValidationErrors {
  name?: string;
  description?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMode,
  initialValues,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ name: false, description: false });
  const { errorToast } = useToaster();

  useEffect(() => {
    if (isOpen && editMode && initialValues) {
      setName(initialValues.name);
      setDescription(initialValues.description || "");
      setErrors({});
      setTouched({ name: false, description: false });
    } else if (isOpen && !editMode) {
      setName("");
      setDescription("");
      setErrors({});
      setTouched({ name: false, description: false });
    }
  }, [isOpen, editMode, initialValues]);

  const validateField = async (field: 'name' | 'description', value: string) => {
    try {
      await yup.reach(categorySchema, field).validate(value);
      setErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors(prev => ({ ...prev, [field]: error.message }));
        return false;
      }
      return true;
    }
  };

  const handleBlur = (field: 'name' | 'description') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, field === 'name' ? name : description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set all fields as touched
    setTouched({ name: true, description: true });

    try {
      // Validate the form values against the schema
      await categorySchema.validate({ name, description }, { abortEarly: false });
      
      // If validation passes, call onSave
      onSave(name, description);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Transform yup error into our error format
        const validationErrors: ValidationErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path as keyof ValidationErrors] = err.message;
          }
        });
        setErrors(validationErrors);
        
        // Show toast for the first error
        if (error.inner.length > 0) {
          errorToast(error.inner[0].message);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden border border-zinc-800"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-6 pt-8">
          <div className="flex items-center mb-4">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-semibold text-zinc-100 flex items-center"
            >
              {editMode ? "Edit Category" : "Add New Category"}
              <Tooltip content="Provide clear and concise category details">
                <Info className="ml-2 h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
              </Tooltip>
            </motion.h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Category Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) {
                      validateField('name', e.target.value);
                    }
                  }}
                  onBlur={() => handleBlur('name')}
                  placeholder="Enter category name"
                  autoFocus
                  className={`w-full px-3 py-2 bg-zinc-800 text-zinc-200 border ${
                    touched.name && errors.name 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-zinc-700 focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                />
                {touched.name && errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (touched.description) {
                      validateField('description', e.target.value);
                    }
                  }}
                  onBlur={() => handleBlur('description')}
                  placeholder="Enter category description"
                  rows={4}
                  className={`w-full px-3 py-2 bg-zinc-800 text-zinc-200 border ${
                    touched.description && errors.description 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-zinc-700 focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 resize-none`}
                />
                {touched.description && errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400"
                  >
                    {errors.description}
                  </motion.p>
                )}
              </motion.div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {editMode ? "Update" : "Add"} Category
              </motion.button>
            </div>
          </form>
        </div>
        <motion.button
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CategoryModal;