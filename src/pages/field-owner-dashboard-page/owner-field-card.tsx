import React from "react";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Settings } from "lucide-react";

interface OwnerFieldCardProps {
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
    isActive: boolean;
}

const OwnerFieldCard: React.FC<OwnerFieldCardProps> = ({
    id,
    name,
    location,
    description,
    rating,
    reviews,
    price,
    sportType,
    imageUrl,
    isActive,
}) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        if (!id) return;
        // Navigate to field details page
        navigate(`/field-owner/fields/${id}`);
    };

    const handleEditField = () => {
        if (!id) return;
        // Navigate to edit field page
        navigate(`/field-owner/fields/${id}/edit`);
    };

    const handleManageField = () => {
        if (!id) return;
        // Navigate to field management page
        navigate(`/field-owner/fields/${id}/manage`);
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
                    <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                        isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </div>
                </div>
                
                {/* Content section */}
                <CardContent className="px-4 py-2 flex-1 text-start">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{name}</h3>
                            <p className="text-gray-600 text-sm mb-1">{location}</p>
                            <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1">
                                {sportType}
                            </div>
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
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleViewDetails}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Eye className="w-4 h-4" />
                                Xem
                            </Button>
                            <Button 
                                onClick={handleEditField}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Edit className="w-4 h-4" />
                                Sửa
                            </Button>
                            <Button 
                                onClick={handleManageField}
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                            >
                                <Settings className="w-4 h-4" />
                                Quản lý
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export default OwnerFieldCard;
