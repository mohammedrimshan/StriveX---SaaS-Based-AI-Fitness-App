export interface FrontendComment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
  textContent: string;
  likes: string[];
  isDeleted: boolean;
  createdAt: string;
}