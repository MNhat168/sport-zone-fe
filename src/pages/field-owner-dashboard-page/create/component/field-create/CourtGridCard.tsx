import { useState } from 'react';
import { ChevronDown, Plus, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Court } from '@/types/field-type';

interface CourtGridCardProps {
    courts: Court[];
    courtsToDelete: string[];
    pendingNewCourts: number; // Number of new courts to add (not yet saved)
    onMarkDelete: (courtId: string) => void;
    onAddCourt: () => void;
    maxCourts?: number;
    isLoading?: boolean;
}

export default function CourtGridCard({
    courts,
    courtsToDelete,
    pendingNewCourts,
    onMarkDelete,
    onAddCourt,
    maxCourts = 10,
    isLoading = false
}: CourtGridCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [courtToConfirmDelete, setCourtToConfirmDelete] = useState<Court | null>(null);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDeleteClick = (court: Court) => {
        setCourtToConfirmDelete(court);
    };

    const confirmDelete = () => {
        if (courtToConfirmDelete) {
            onMarkDelete(courtToConfirmDelete.id);
            setCourtToConfirmDelete(null);
        }
    };

    const cancelDelete = () => {
        setCourtToConfirmDelete(null);
    };

    // Calculate total courts count
    const activeCourtsCount = courts.filter(c => !courtsToDelete.includes(c.id)).length + pendingNewCourts;
    const canAddMore = activeCourtsCount < maxCourts;

    return (
        <>
            <Card className="bg-white shadow-md border-0">
                <CardHeader
                    onClick={toggleExpanded}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>Quản lý Court</CardTitle>
                            <span className="text-sm text-gray-500">
                                ({activeCourtsCount}/{maxCourts})
                            </span>
                        </div>
                        <ChevronDown
                            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </div>
                </CardHeader>

                {isExpanded && (
                    <>
                        <hr className="border-t border-gray-300 my-0 mx-6" />
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-500 mb-4">
                                Click nút X để đánh dấu xóa court. Thay đổi chỉ được lưu khi bạn bấm "Lưu thay đổi".
                            </p>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {/* Render existing courts */}
                                {courts.map((court) => {
                                    const isMarkedForDelete = courtsToDelete.includes(court.id);
                                    return (
                                        <div
                                            key={court.id}
                                            className={`
                                                relative rounded-lg border-2 p-3 
                                                flex flex-col items-center justify-center
                                                min-h-[80px] transition-all duration-200
                                                ${isMarkedForDelete
                                                    ? 'bg-red-50 border-red-300 opacity-60'
                                                    : 'bg-green-50 border-green-200 hover:border-green-400'
                                                }
                                            `}
                                        >
                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isMarkedForDelete) {
                                                        // Undo delete
                                                        onMarkDelete(court.id);
                                                    } else {
                                                        handleDeleteClick(court);
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className={`
                                                    absolute -top-2 -right-2 
                                                    w-6 h-6 rounded-full 
                                                    flex items-center justify-center
                                                    transition-colors
                                                    ${isMarkedForDelete
                                                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                                title={isMarkedForDelete ? 'Hoàn tác xóa' : 'Xóa court'}
                                            >
                                                {isMarkedForDelete ? (
                                                    <span className="text-xs font-bold">↺</span>
                                                ) : (
                                                    <X className="w-3 h-3" />
                                                )}
                                            </button>

                                            {/* Court info */}
                                            <span className={`
                                                text-2xl font-bold
                                                ${isMarkedForDelete ? 'text-red-400 line-through' : 'text-green-600'}
                                            `}>
                                                {court.courtNumber || (courts.indexOf(court) + 1)}
                                            </span>
                                            <span className={`
                                                text-xs mt-1 text-center truncate w-full
                                                ${isMarkedForDelete ? 'text-red-400' : 'text-gray-600'}
                                            `}>
                                                {court.name || `Sân ${court.courtNumber}`}
                                            </span>
                                            {isMarkedForDelete && (
                                                <span className="text-xs text-red-500 font-medium mt-1">
                                                    Sẽ xóa
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Render pending new courts (visual placeholders) */}
                                {Array.from({ length: pendingNewCourts }).map((_, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="relative rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-3 flex flex-col items-center justify-center min-h-[80px]"
                                    >
                                        <span className="text-2xl font-bold text-blue-400">
                                            {courts.length + index + 1 - courtsToDelete.length}
                                        </span>
                                        <span className="text-xs text-blue-500 mt-1">
                                            Mới
                                        </span>
                                    </div>
                                ))}

                                {/* Add court button */}
                                {canAddMore && (
                                    <button
                                        type="button"
                                        onClick={onAddCourt}
                                        disabled={isLoading}
                                        className="
                                            rounded-lg border-2 border-dashed border-gray-300 
                                            bg-gray-50 hover:bg-gray-100 hover:border-gray-400
                                            p-3 flex flex-col items-center justify-center
                                            min-h-[80px] transition-all duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    >
                                        <Plus className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">
                                            Thêm court
                                        </span>
                                    </button>
                                )}
                            </div>

                            {courtsToDelete.length > 0 && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-amber-700 font-medium">
                                            {courtsToDelete.length} court sẽ bị xóa khi lưu thay đổi
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            Court có lịch đặt đang hoạt động sẽ không thể xóa.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Confirm Delete Dialog */}
            <AlertDialog open={!!courtToConfirmDelete} onOpenChange={(open) => !open && cancelDelete()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa court</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn đánh dấu xóa "{courtToConfirmDelete?.name || `Sân ${courtToConfirmDelete?.courtNumber}`}"?
                            <br /><br />
                            Court sẽ bị xóa khi bạn bấm "Lưu thay đổi". Nếu court có lịch đặt đang hoạt động, việc xóa sẽ thất bại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            Đánh dấu xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
