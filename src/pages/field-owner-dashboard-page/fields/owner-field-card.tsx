import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Settings } from "lucide-react";
import { getSportDisplayNameVN } from "@/components/enums/ENUMS";
import { getPinColor, getSportWhiteIconPath } from "@/utils/fieldPinIcon";
import { FieldStatusManagementDialog } from "./components/field-status-management-dialog";

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
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

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
        // Open management dialog
        setIsManageDialogOpen(true);
    };

    const sportIconPath = getSportWhiteIconPath(sportType);
    const sportColor = getPinColor(sportType);

    return (
        <Card className="w-full overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow ">
            <div className="flex">
                {/* Image section */}
                <div className="relative w-32 h-40 flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={`${name} field`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback image nếu không load được
                            (e.target as HTMLImageElement).src = "/placeholder-field.jpg";
                        }}
                    />
                    <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </div>
                </div>

                {/* Content section */}
                <CardContent className="px-4 py-2 flex-1 flex text-start">
                    {/* Left Column: All Information */}
                    <div className="flex-1 pr-4 min-w-0">
                        <div className="mb-2">
                            <h3 className="text-xl font-bold mb-1">{name}</h3>
                            <p className="text-gray-600 text-sm mb-1 break-words">{location}</p>
                            <div
                                className="text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 flex items-center gap-1 w-fit"
                                style={{ backgroundColor: sportColor }}
                            >
                                {sportIconPath && (
                                    <img
                                        src={sportIconPath}
                                        alt={sportType}
                                        className="w-4 h-4"
                                    />
                                )}
                                {getSportDisplayNameVN(sportType)}
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

                        <div className="flex items-center">
                            <span className="text-yellow-500 text-lg">★ {rating}</span>
                            <span className="text-gray-600 text-sm ml-1">({reviews} reviews)</span>
                        </div>
                    </div>

                    {/* Right Column: Price and Action Buttons */}
                    <div className="flex flex-col justify-between items-end flex-shrink-0 min-w-[120px]">
                        <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap mb-4">
                            {price}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleViewDetails}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 w-28 justify-start"
                            >
                                <Eye className="w-4 h-4 text-blue-500" />
                                Xem
                            </Button>
                            <Button
                                onClick={handleEditField}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 w-28 justify-start"
                            >
                                <Edit className="w-4 h-4 text-amber-500" />
                                Sửa
                            </Button>
                            <Button
                                onClick={handleManageField}
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 w-28 justify-start border-green-600"
                            >
                                <Settings className="w-4 h-4" />
                                Quản lý
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </div>

            {/* Field Status Management Dialog */}
            {id && (
                <FieldStatusManagementDialog
                    isOpen={isManageDialogOpen}
                    onOpenChange={setIsManageDialogOpen}
                    fieldId={id}
                    fieldName={name}
                    currentStatus={isActive}
                />
            )}
        </Card>
    );
};

export default OwnerFieldCard;
