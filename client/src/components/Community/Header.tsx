// frontend/src/components/Community/Header.tsx
import { Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import UserAvatar from './UserAvatar';
import CreatePostModal from './CreatePostModal';
import { Badge } from '../ui/badge';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/userSelectors';

interface HeaderProps {
  onPostCreated: (content: string, imageFile?: File) => void;
}

const Header = ({ onPostCreated }: HeaderProps) => {
  const currentUser = useSelector(selectCurrentUser);

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 py-3">
      <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-strivex-violet to-strivex-red bg-clip-text text-transparent">
            StriveX Community
          </h1>
        </div>

        <div className="hidden md:flex relative max-w-[240px] flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search posts..."
            className="pl-8 h-9 rounded-full bg-gray-100 border-gray-200"
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <div className="hidden sm:block">
            <CreatePostModal onPostCreated={onPostCreated} />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-strivex-red text-[10px]">
              3
            </Badge>
          </Button>

          <UserAvatar user={currentUser} size="sm" />
        </div>
      </div>
    </header>
  );
};

export default Header;