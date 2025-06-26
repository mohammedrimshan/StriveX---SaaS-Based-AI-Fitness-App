import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Instagram, 
  Twitter, 
  Facebook, 
  ChevronDown, 
  ChevronUp, 
  Upload
} from 'lucide-react';
import { useToaster } from '@/hooks/ui/useToaster';


interface FAQ {
  question: string;
  answer: string;
}

const SupportPage = () => {
  const { successToast, errorToast } = useToaster();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    file: null as File | null
  });

  const faqs: FAQ[] = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a reset link within minutes.'
    },
    {
      question: 'How do I track my workout progress?',
      answer: 'Navigate to your Dashboard and click on "Progress". You can view detailed analytics, set goals, and track your fitness journey over time.'
    },
    {
      question: 'Can I sync data with other fitness apps?',
      answer: 'Yes! StriveX integrates with popular fitness trackers and apps. Go to Settings > Integrations to connect your favorite fitness platforms.'
    },
    {
      question: 'How do I report a bug or technical issue?',
      answer: 'Use the contact form below or email us directly at support@strivex.com. Include screenshots if possible to help us resolve the issue quickly.'
    },
    {
      question: 'What subscription plans are available?',
      answer: 'We offer Free, Pro, and Premium plans. Visit your Account Settings to view features and upgrade options that best fit your fitness goals.'
    }
  ];

  const handleFAQToggle = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.description) {
      errorToast( "Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errorToast( "Please enter a valid email address.");
      return;
    }

    // Simulate form submission
    successToast("Form submitted successfully!");

    setFormData({ name: '', email: '', description: '', file: null });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Support Center</h1>
          <p className="text-gray-600">We're here to help you get the most out of StriveX</p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Contact Options */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-3">Mon-Fri, 9AM-6PM EST</p>
              <a href="tel:+1-555-123-4567" className="text-purple-600 hover:text-purple-700 font-medium">
                +1 (555) 123-4567
              </a>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-3">We respond within 24 hours</p>
              <a href="mailto:support@strivex.com" className="text-purple-600 hover:text-purple-700 font-medium">
                support@strivex.com
              </a>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <div className="flex space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-purple-600" />
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Twitter className="h-5 w-5 text-purple-600" />
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Follow Us</h3>
              <p className="text-gray-600">Stay updated with tips and news</p>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQs Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h2>
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b last:border-b-0">
                <button
                  onClick={() => handleFAQToggle(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-600" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact Form */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Send us a Message</h2>
          <div className="bg-white rounded-xl shadow-lg border p-8">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe your question or issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {formData.file ? formData.file.name : 'Upload screenshot or document'}
                    </span>
                  </label>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SupportPage;
