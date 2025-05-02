interface TypingIndicatorProps {
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string
    isOnline: boolean
  }
}

export function TypingIndicator({ user }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 animate-fade-in mb-3">
      <img
        src={user.avatar || "https://via.placeholder.com/32"}
        alt={`${user.firstName} ${user.lastName}`}
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
      />
      <div className="bg-white rounded-xl rounded-bl-none px-4 py-3 flex items-center shadow-md">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-typing-1"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-typing-2"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-typing-3"></div>
        </div>
      </div>
    </div>
  )
}
