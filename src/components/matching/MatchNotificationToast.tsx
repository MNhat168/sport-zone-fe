import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';

interface MatchNotificationToastProps {
    matchedUser: {
        fullName: string;
        avatar?: string;
        _id: string;
    };
    matchId: string;
    onDismiss?: () => void;
}

export const MatchNotificationToast: React.FC<MatchNotificationToastProps> = ({
    matchedUser,
    matchId,
    onDismiss,
}) => {
    const navigate = useNavigate();

    const handleViewMatch = () => {
        navigate(`/matching/matches/${matchId}`);
        onDismiss?.();
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200">
            {/* Animated Heart Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-75" />
                <div className="relative bg-pink-500 text-white rounded-full p-3">
                    <Heart size={24} fill="currentColor" />
                </div>
            </div>

            {/* User Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={matchedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedUser._id}`}
                    alt={matchedUser.fullName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg">Hợp quá! 🎉</h3>
                <p className="text-sm text-slate-700">
                    Bạn đã bắt cặp với <strong>{matchedUser.fullName}</strong>!
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                    Hãy nhắn tin ngay để hẹn giờ chơi nhé
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <Button
                    onClick={handleViewMatch}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                >
                    <MessageCircle size={14} className="mr-1" />
                    Nhắn tin
                </Button>
            </div>
        </div>
    );
};
