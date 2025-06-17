"use client";

import { motion } from "framer-motion";
import { Music } from "lucide-react";

// Define a mapping of categories to Spotify playlist URLs
const playlistMap: Record<string, string> = {
  Yoga: "https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator&theme=0",
  Meditation: "https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator&theme=0",
  Cardio: "https://open.spotify.com/embed/playlist/37i9dQZF1DWSJHnPb1f0X3?utm_source=generator&theme=0",
  Pilates: "https://open.spotify.com/embed/artist/6X6Ttm4Y4bqq0DCXG8QkRO?utm_source=generator&theme=0",
  WeightTraining: "https://open.spotify.com/embed/album/6Y5p78JBYa1H5W5Yxuh55Q?utm_source=generator",
  Calisthenics: "https://open.spotify.com/embed/playlist/6f3KNQRhnOuRB916gv7BWG?utm_source=generator&theme=0",
  All: "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator&theme=0",
};

interface MusicPlayerProps {
  category?: string; // Make category optional
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ category = "All", className }) => {
  console.log("Current category:", category);
  
  // Select the playlist URL based on the category, fallback to 'All' if category is not found
  const playlistUrl = playlistMap[category] || playlistMap["All"];
  console.log("Selected playlist URL:", playlistUrl);
  
  return (
    <motion.div
      className={`bg-purple-600 rounded-2xl overflow-hidden shadow-lg ${className || ""}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-purple-700 bg-opacity-90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center">
          <Music className="h-5 w-5 text-white mr-2" />
          <h2 className="text-lg font-semibold text-white">StriveX Player</h2>
        </div>
        <div className="text-white text-sm">
          {category} Music
        </div>
      </div>

      <div className="p-4 bg-purple-600">
        <iframe
          style={{ borderRadius: "12px", backgroundColor: "#9333ea" }}
          src={playlistUrl}
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
};

export default MusicPlayer;