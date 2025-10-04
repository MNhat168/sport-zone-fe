import React from "react";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Props cho CoachCard
 * @example
 * {
 *   id: "507f1f77bcf86cd799439011",
 *   name: "John Doe",
 *   location: "Hà Nội",
 *   description: "Chuyên gia cầu lông",
 *   rating: 4.8,
 *   reviews: 120,
 *   price: "200.000đ",
 *   nextAvailability: "Thứ 6, 10:00"
 * }
 */
interface CoachCardProps {
    id: string;
    name: string;
    location: string;
    description: string;
    rating: number;
    reviews: number;
    price: string;
    nextAvailability: string;
}

const CoachCard: React.FC<CoachCardProps> = ({
    id,
    name,
    location,
    description,
    rating,
    reviews,
    price,
    nextAvailability,
}) => {
    const navigate = useNavigate();

    /**
     * Xử lý khi click vào card
     */
    const handleCardClick = () => {
        navigate(`/coach-detail/${id}`);
    };

    return (
        <Card
            className="w-full overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex">
                {/* Avatar section */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <img
                        src="/placeholder-avatar.jpg"
                        alt={`${name}'s avatar`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Professional
                    </div>
                </div>
                {/* Content section */}
                <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{name}</h3>
                            <p className="text-gray-600 text-sm mb-1">{location}</p>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                            From {price}
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-yellow-500 text-lg">★ {rating}</span>
                            <span className="text-gray-600 text-sm ml-1">({reviews} reviews)</span>
                            <div className="flex items-center text-gray-600 text-sm ml-4">
                                <span className="mr-1">📅</span>
                                <span>Next: </span>
                                <span className="text-green-600 ml-1">{nextAvailability}</span>
                            </div>
                        </div>
                        <Button className="bg-black text-white hover:bg-gray-800">Book Now</Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export default CoachCard;