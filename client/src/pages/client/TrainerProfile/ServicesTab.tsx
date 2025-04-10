import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Flame,
  Users,
  Laptop,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export const ServicesTab = () => {
  // Dummy services array directly inside the component
  const services = [
    {
      id: "s-1",
      title: "Personal Training",
      description:
        "One-on-one personalized training sessions tailored to your specific goals and fitness level.",
      price: "$75",
      duration: "60 min",
      icon: "dumbbell",
    },
    {
      id: "s-2",
      title: "Nutrition Consultation",
      description:
        "Comprehensive nutrition planning and guidance to complement your fitness routine.",
      price: "$60",
      duration: "45 min",
      icon: "flame",
    },
    {
      id: "s-3",
      title: "Group Training",
      description:
        "High-energy group sessions that combine strength training and cardio for maximum results.",
      price: "$30",
      duration: "45 min",
      icon: "users",
    },
    {
      id: "s-4",
      title: "Online Coaching",
      description:
        "Remote training programs with regular check-ins and adjustments based on your progress.",
      price: "$200",
      duration: "Monthly",
      icon: "laptop",
    },
    {
      id: "s-5",
      title: "Fitness Assessment",
      description:
        "Comprehensive evaluation of your current fitness level, mobility, and body composition.",
      price: "$90",
      duration: "75 min",
      icon: "clipboard-check",
    },
    {
      id: "s-6",
      title: "Recovery Session",
      description:
        "Guided stretching and recovery techniques to improve mobility and reduce soreness.",
      price: "$50",
      duration: "45 min",
      icon: "refresh-cw",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dumbbell":
        return <Dumbbell className="h-6 w-6" />;
      case "flame":
        return <Flame className="h-6 w-6" />;
      case "users":
        return <Users className="h-6 w-6" />;
      case "laptop":
        return <Laptop className="h-6 w-6" />;
      case "clipboard-check":
        return <ClipboardCheck className="h-6 w-6" />;
      case "refresh-cw":
        return <RefreshCw className="h-6 w-6" />;
      default:
        return <Dumbbell className="h-6 w-6" />;
    }
  };

  const getColor = (iconName: string) => {
    switch (iconName) {
      case "dumbbell":
        return "from-blue-600 to-blue-700";
      case "flame":
        return "from-green-600 to-green-700";
      case "users":
        return "from-violet-600 to-violet-700";
      case "laptop":
        return "from-amber-500 to-amber-600";
      case "clipboard-check":
        return "from-rose-500 to-rose-600";
      case "refresh-cw":
        return "from-cyan-500 to-cyan-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {services.map((service) => (
        <motion.div key={service.id} variants={item}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <div
              className={`bg-gradient-to-r ${getColor(
                service.icon
              )} p-4 text-white`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  {getIcon(service.icon)}
                  <span className="ml-2">{service.title}</span>
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  {service.duration}
                </Badge>
              </div>
            </div>
            <CardContent className="pt-6 flex flex-col h-[calc(100%-4rem)]">
              <p className="mb-6 flex-grow">{service.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-2xl font-bold">{service.price}</div>
                <Button size="sm">Book Now</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
