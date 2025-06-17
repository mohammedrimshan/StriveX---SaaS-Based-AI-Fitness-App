"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
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
          <div className="bg-white/70 text-zinc-800 text-xs rounded-md px-3 py-2 shadow-2xl border border-violet-300/20 backdrop-blur-sm">
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
    .transform((value) => (value === "" ? null : value)),
  metValue: yup
    .number()
    .typeError("MET value must be a number")
    .required("MET value is required")
    .min(0.1, "MET value must be at least 0.1"),
});

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, metValue: number) => void;
  editMode: boolean;
  initialValues?: { name: string; description: string; metValue: number };
}

interface ValidationErrors {
  name?: string;
  description?: string;
  metValue: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMode,
  initialValues,
}) => {
  const [name, setName] = useState("");
  const [metValue, setMetValue] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Partial<ValidationErrors>>({});
  const [touched, setTouched] = useState({
    name: false,
    description: false,
    metValue: false,
  });
  const { errorToast } = useToaster();

  useEffect(() => {
    if (isOpen && editMode && initialValues) {
      setName(initialValues.name);
      setDescription(initialValues.description || "");
      setMetValue(initialValues.metValue.toString() || "");
      setErrors({});
      setTouched({ name: false, description: false, metValue: false });
    } else if (isOpen && !editMode) {
      setName("");
      setDescription("");
      setMetValue("");
      setErrors({});
      setTouched({ name: false, description: false, metValue: false });
    }
  }, [isOpen, editMode, initialValues]);

  const validateField = async (
    field: "name" | "description" | "metValue",
    value: string | number
  ) => {
    try {
      // Create a test object with just the field we're validating
      const testObj: any = {};
      testObj[field] = value;

      // Validate just this field
      await yup.reach(categorySchema, field);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [field]: error.message }));
        return false;
      }
      return true;
    }
  };

  const handleBlur = (field: "name" | "description" | "metValue") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") {
      validateField(field, name);
    } else if (field === "description") {
      validateField(field, description);
    } else if (field === "metValue") {
      validateField(field, parseFloat(metValue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set all fields as touched
    setTouched({ name: true, description: true, metValue: true });

    try {
      // Convert metValue string to number for validation
      const metValueNumber = parseFloat(metValue);

      // Log values for debugging
      console.log("Form values:", {
        name,
        description,
        metValue,
        metValueNumber,
      });

      // Validate the form values against the schema
      await categorySchema.validate(
        { name, description, metValue: metValueNumber },
        { abortEarly: false }
      );

      // If validation passes, call onSave with the correct parameters
      console.log("Calling onSave with:", {
        name,
        description,
        metValue: metValueNumber,
      });
      onSave(name, description, metValueNumber);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Transform yup error into our error format
        const validationErrors: Partial<ValidationErrors> = {};
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

        // Log validation errors for debugging
        console.log("Validation errors:", validationErrors);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="absolute inset-0 "
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            className="bg-white/75 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden border border-violet-300/20 backdrop-blur-md"
          >
            <motion.div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  "linear-gradient(to right, rgba(139,92,246,0.7), rgba(244,114,182,0.7))",
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />

            <div className="p-6 pt-8">
              <div className="flex items-center mb-6">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-semibold text-zinc-800 flex items-center"
                >
                  {editMode ? "Edit Category" : "Add New Category"}
                  <Tooltip content="Provide clear and concise category details">
                    <Info className="ml-2 h-4 w-4 text-violet-500 hover:text-violet-700 transition-colors" />
                  </Tooltip>
                </motion.h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-5">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      Category Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (touched.name) {
                          validateField("name", e.target.value);
                        }
                      }}
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter category name"
                      autoFocus
                      className={`w-full px-3 py-2 bg-white/50 text-zinc-800 border ${
                        touched.name && errors.name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-violet-300/40 focus:ring-violet-500"
                      } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                    />
                    {touched.name && errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label
                      htmlFor="metValue"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      MET Value
                    </label>
                    <input
                      id="metValue"
                      type="number"
                      step="0.1"
                      value={metValue}
                      onChange={(e) => {
                        setMetValue(e.target.value);
                        if (touched.metValue) {
                          validateField("metValue", parseFloat(e.target.value));
                        }
                      }}
                      onBlur={() => handleBlur("metValue")}
                      placeholder="Enter MET value"
                      className={`w-full px-3 py-2 bg-white/50 text-zinc-800 border ${
                        touched.metValue && errors.metValue
                          ? "border-red-500 focus:ring-red-500"
                          : "border-violet-300/40 focus:ring-violet-500"
                      } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                    />
                    {touched.metValue && errors.metValue && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.metValue}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (touched.description) {
                          validateField("description", e.target.value);
                        }
                      }}
                      onBlur={() => handleBlur("description")}
                      placeholder="Enter category description"
                      rows={4}
                      className={`w-full px-3 py-2 bg-white/50 text-zinc-800 border ${
                        touched.description && errors.description
                          ? "border-red-500 focus:ring-red-500"
                          : "border-violet-300/40 focus:ring-violet-500"
                      } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 resize-none`}
                    />
                    {touched.description && errors.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
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
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(243, 244, 246, 0.8)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100/60 text-zinc-700 rounded-lg transition-all duration-300 border border-gray-200/50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(139,92,246,0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500/90 to-pink-500/90 text-white rounded-lg transition-all disabled:opacity-50 font-medium shadow-md"
                  >
                    {editMode ? "Update" : "Add"} Category
                  </motion.button>
                </div>
              </form>
            </div>
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(139,92,246,0.1)",
                color: "rgba(139,92,246,1)",
              }}
              className="absolute right-4 top-4 rounded-full p-1 text-violet-500 transition-all duration-300"
              onClick={onClose}
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

export default CategoryModal;
