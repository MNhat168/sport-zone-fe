import React from "react";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hook";
import { getFieldById } from "@/features/field/fieldThunk";

interface FieldCardProps {
    id?: string;
    name: string;
    location: string;
    description: string;
    rating: number;
    reviews: number;
    price: string;
    nextAvailability: string;
    sportType: string;
    imageUrl: string;
    distance?: string;
}

const FieldCard: React.FC<FieldCardProps> = ({
    id,
    name,
    location,
    description,
    rating,
    reviews,
    price,
    nextAvailability,
    sportType,
    imageUrl,
    distance,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleBooking = async () => {
        if (!id) return;
        try {
            await dispatch(getFieldById(id));
        } finally {
            navigate("/field-booking", { state: { fieldId: id } });
        }
    };
    return (
        <Card className="w-full overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
            <div className="flex">
                {/* Image section */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={`${name} field`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback image nếu không load được
                            (e.target as HTMLImageElement).src = "/placeholder-field.jpg";
                        }}
                    />
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {sportType}
                    </div>
                </div>
                
                {/* Content section */}
                <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{name}</h3>
                            <p className="text-gray-600 text-sm mb-1">{location}</p>
                            {distance && (
                                <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                                    📍 {distance} từ vị trí của bạn
                                </p>
                            )}
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
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
                                <span>Available: </span>
                                <span className="text-green-600 ml-1">{nextAvailability}</span>
                            </div>
                        </div>
                        <Button 
                            onClick={handleBooking}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            Book Field
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export default FieldCard;