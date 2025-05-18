export enum RoleType {
  USER = "USER",
  PROFESSIONAL = "PROFESSIONAL",
  ADMIN = "ADMIN"
}

export const POST_CATEGORIES = [
  'Yoga',
  'Cardio',
  'WeightTraining',
  'Meditation',
  'Calisthenics',
  'Pilates',
  'General',
] as const;
export type WorkoutType = typeof POST_CATEGORIES[number];

export const SAMPLE_POSTS = [
  {
    id: "1",
    authorId: "user1",
    role: RoleType.PROFESSIONAL,
    textContent: "Just finished a new HIIT workout! 30 minutes of pure fire 🔥 Who's joining me tomorrow?",
    mediaUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    category: "Workout",
    likes: ["user2", "user3", "user4"],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    isDeleted: false,
    reports: [],
    commentsCount: 5,
    author: {
      _id: "user1",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  },
  {
    id: "2",
    authorId: "user2",
    role: RoleType.USER,
    textContent: "My progress after 3 months of consistent training and clean eating. Never thought I'd get here but persistence pays off! 💪",
    mediaUrl: "https://images.unsplash.com/photo-1493962853295-0fd70327578a",
    category: "Progress",
    likes: ["user1", "user3"],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    isDeleted: false,
    reports: [],
    commentsCount: 12,
    author: {
      _id: "user2",
      firstName: "Chris",
      lastName: "Johnson",
      email: "chris@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    id: "3",
    authorId: "user3",
    role: RoleType.PROFESSIONAL,
    textContent: "5 essential nutrients you need after an intense workout session. Swipe to learn more! #nutrition #recovery",
    mediaUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    category: "Nutrition",
    likes: ["user1", "user2", "user4", "user5"],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    isDeleted: false,
    reports: [],
    commentsCount: 8,
    author: {
      _id: "user3",
      firstName: "Sophia",
      lastName: "Lee",
      email: "sophia@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  },
  {
    id: "4",
    authorId: "user4",
    role: RoleType.USER,
    textContent: "Just scored these new resistance bands! Can't wait to add them to my home workout routine. Any favorite exercises?",
    mediaUrl: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937",
    category: "Equipment",
    likes: ["user2", "user3"],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
    isDeleted: false,
    reports: [],
    commentsCount: 4,
    author: {
      _id: "user4",
      firstName: "Mike",
      lastName: "Taylor",
      email: "mike@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  },
  {
    id: "5",
    authorId: "user5",
    role: RoleType.PROFESSIONAL,
    textContent: "The perfect Sunday morning: meditation, stretching, and a nutritious breakfast. Start your week right! #wellnessfirst",
    mediaUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    category: "Recovery",
    likes: ["user1", "user3"],
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
    isDeleted: false,
    reports: [],
    commentsCount: 7,
    author: {
      _id: "user5",
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
    }
  }
];

export const SAMPLE_COMMENTS = [
  {
    id: "c1",
    postId: "1",
    authorId: "user2",
    role: RoleType.USER,
    textContent: "Love this workout! Will definitely try tomorrow.",
    likes: ["user1", "user3"],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
    isDeleted: false,
    reports: [],
    author: {
      _id: "user2",
      firstName: "Chris",
      lastName: "Johnson",
      email: "chris@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    id: "c2",
    postId: "1",
    authorId: "user3",
    role: RoleType.PROFESSIONAL,
    textContent: "Great routine! I would recommend adding a 5-min cooldown stretch at the end.",
    likes: ["user1"],
    createdAt: new Date(Date.now() - 2700000),
    updatedAt: new Date(Date.now() - 2700000),
    isDeleted: false,
    reports: [],
    author: {
      _id: "user3",
      firstName: "Sophia",
      lastName: "Lee",
      email: "sophia@fitness.com",
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  }
];

export const CURRENT_USER = {
  _id: "user1",
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex@fitness.com",
  profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
  role: RoleType.PROFESSIONAL,
  category: "Workout" // Added the category property
};
