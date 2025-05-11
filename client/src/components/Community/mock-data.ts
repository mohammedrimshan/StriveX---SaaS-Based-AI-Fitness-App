import { Post, User } from "./index";

export const currentUser: User = {
  id: "user-current",
  name: "Alex Rivera",
  avatarUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop",
  preferredWorkout: "HIIT",
  isTrainer: false,
};

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
    preferredWorkout: "Yoga",
    isTrainer: false,
  },
  {
    id: "user-2",
    name: "Mike Chen",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=250&auto=format&fit=crop",
    preferredWorkout: "CrossFit",
    isTrainer: false,
  },
  {
    id: "user-3",
    name: "Coach Emma",
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=250&auto=format&fit=crop",
    specialization: "Strength Training",
    isTrainer: true,
  },
  {
    id: "user-4",
    name: "Trainer David",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=250&auto=format&fit=crop",
    specialization: "Nutrition",
    isTrainer: true,
  }
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    content: "Just finished a 5-mile run! Feeling amazing and energized. What's your workout plan for today? #MorningRun #Fitness",
    author: mockUsers[0],
    createdAt: "2025-05-07T08:30:00Z",
    category: "Yoga",
    likes: 24,
    comments: [
      {
        id: "comment-1-1",
        content: "Great job! I'm doing HIIT this afternoon.",
        author: currentUser,
        createdAt: "2025-05-07T09:15:00Z",
        likes: 3,
        hasLiked: false,
      },
      {
        id: "comment-1-2",
        content: "That's inspiring! Keep it up!",
        author: mockUsers[2],
        createdAt: "2025-05-07T10:05:00Z",
        likes: 1,
        hasLiked: true,
      }
    ],
    commentCount: 2,
    hasLiked: true,
  },
  {
    id: "post-2",
    content: "Here's the protein shake recipe I've been using for the past month. Seeing great results! Let me know if you try it out.",
    imageUrl: "https://images.unsplash.com/photo-1606674727310-6d55b6960d8f?q=80&w=800&auto=format&fit=crop",
    author: mockUsers[3],
    createdAt: "2025-05-06T14:22:00Z",
    category: "Nutrition",
    likes: 38,
    comments: [],
    commentCount: 0,
    hasLiked: false,
  },
  {
    id: "post-3",
    content: "Just hit a new PR on my deadlift! 💪 Been working on my form for weeks and it finally paid off. Anyone else making strength gains lately?",
    author: mockUsers[1],
    createdAt: "2025-05-06T11:45:00Z",
    category: "CrossFit",
    likes: 42,
    comments: [
      {
        id: "comment-3-1",
        content: "Congrats! What's your current PR?",
        author: mockUsers[2],
        createdAt: "2025-05-06T12:30:00Z",
        likes: 0,
        hasLiked: false,
      }
    ],
    commentCount: 1,
    hasLiked: true,
  },
  {
    id: "post-4",
    content: "Today's stretching routine for recovery day. Remember that rest is just as important as the workout itself! #RecoveryDay",
    videoUrl: "https://example.com/fake-video-url.mp4",
    imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop",
    author: mockUsers[2],
    createdAt: "2025-05-05T16:10:00Z",
    category: "Strength Training",
    likes: 56,
    comments: [],
    commentCount: 0,
    hasLiked: false,
  },
  {
    id: "post-5",
    content: "Had an amazing HIIT session this morning! Who else loves the endorphin rush after an intense workout? Share your favorite HIIT exercises below!",
    author: currentUser,
    createdAt: "2025-05-05T09:20:00Z",
    category: "HIIT",
    likes: 18,
    comments: [
      {
        id: "comment-5-1",
        content: "Burpees are my go-to! Tough but effective.",
        author: mockUsers[1],
        createdAt: "2025-05-05T10:15:00Z",
        likes: 2,
        hasLiked: true,
      }
    ],
    commentCount: 1,
    hasLiked: false,
  }
];
