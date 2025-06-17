import  { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const TrainerStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('trainer-stats');
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      title: "Active Clients",
      value: "24",
      change: "+3",
      isPositive: true,
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-500",
      chartData: [35, 40, 30, 50, 45, 60, 70],
    },
    {
      title: "Sessions This Week",
      value: "18",
      change: "+2",
      isPositive: true,
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-violet-500",
      chartData: [40, 35, 45, 30, 50, 55, 60],
    },
    {
      title: "Revenue This Month",
      value: "$3,240",
      change: "+12%",
      isPositive: true,
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-green-500",
      chartData: [30, 40, 45, 50, 55, 70, 65],
    },
    {
      title: "Client Retention",
      value: "92%",
      change: "-2%",
      isPositive: false,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-orange-500",
      chartData: [80, 85, 90, 88, 87, 92, 90],
    }
  ];

  return (
    <section id="trainer-stats" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={cn(
                "border border-gray-100 shadow-lg overflow-hidden",
                "transform transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs font-medium flex items-center ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="mt-4 h-10">
                  <div className="flex items-end h-full space-x-1">
                    {stat.chartData.map((value, i) => (
                      <div 
                        key={i} 
                        className={`w-full bg-opacity-20 rounded-sm ${stat.color.replace('bg-', 'bg-')} transition-all duration-500`}
                        style={{ 
                          height: `${value}%`,
                          transitionDelay: `${(index * 100) + (i * 50)}ms`,
                          transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                          transformOrigin: 'bottom'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainerStats;
