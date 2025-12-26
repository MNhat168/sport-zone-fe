"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useAppDispatch } from '@/store/hook';
import { getCancellationFee, cancelTournamentById } from '@/features/tournament/tournamentThunk';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CancelTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentId: string;
}

export function CancelTournamentModal({ isOpen, onClose, tournamentId }: CancelTournamentModalProps) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [feeData, setFeeData] = useState<any>(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && tournamentId) {
            setLoading(true);
            setError(null);
            dispatch(getCancellationFee(tournamentId))
                .unwrap()
                .then((response) => {
                    // Extract data from nested structure
                    const data = response.data || response;
                    setFeeData(data);
                })
                .catch(() => {
                    setError("Failed to calculate cancellation fee");
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, tournamentId, dispatch]);

    const handleConfirm = async () => {
        // Validate reason
        if (!reason || reason.trim() === '') {
            setError('Please provide a reason for cancellation');
            return;
        }

        setIsSubmitting(true);
        setError(null); // Clear previous errors
        try {
            const response = await dispatch(cancelTournamentById({ id: tournamentId, reason })).unwrap();

            // Extract data from nested structure (backend returns {success: true, data: {...}})
            const result = response.data || response;

            console.log('Cancellation response:', response);
            console.log('Cancellation result:', result);
            console.log('Fee required:', result.feeRequired);
            console.log('Payment URL:', result.paymentUrl);

            if (result.feeRequired && result.paymentUrl) {
                // Redirect to PayOS payment page
                console.log('Redirecting to PayOS:', result.paymentUrl);
                window.location.href = result.paymentUrl;
            } else {
                // Success (Free cancellation)
                console.log('Free cancellation successful');
                onClose();
            }
        } catch (err: any) {
            console.error('Cancellation error:', err);
            setError(err.message || "Cancellation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Cancel Tournament
                    </DialogTitle>
                    <DialogDescription>
                        Please review the cancellation policy below.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loading size={32} />
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4 py-4">
                        {feeData && (
                            <div className={`p-4 rounded-lg border ${feeData.fee > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                <h3 className={`font-semibold mb-2 ${feeData.fee > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                                    {feeData.fee > 0 ? 'Cancellation Fee Required' : 'Free Cancellation'}
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Fee Amount:</span>
                                        <span className="font-bold">
                                            {(feeData.fee || 0).toLocaleString()} VND
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Policy:</span>
                                        <span>{feeData.reason}</span>
                                    </div>
                                    {feeData.fee > 0 && (
                                        <div className="mt-2 text-xs text-orange-700">
                                            * Fee must be paid to complete cancellation. Use the same banking QR flow.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Cancellation</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please explain why you are cancelling..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Close
                    </Button>
                    <Button
                        variant={feeData?.fee > 0 ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={isSubmitting || loading || error !== null}
                        className={feeData?.fee > 0 ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                        {isSubmitting ? (
                            <>
                                <Loading size={16} className="mr-2" />
                                Processing...
                            </>
                        ) : feeData?.fee && feeData.fee > 0 ? (
                            `Pay & Cancel (${(feeData.fee || 0).toLocaleString()} VND)`
                        ) : (
                            "Confirm Cancellation"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
