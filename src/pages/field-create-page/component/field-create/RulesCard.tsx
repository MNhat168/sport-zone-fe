import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RulesCard() {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Card className="shadow-md border-0">
            <CardHeader 
                onClick={toggleExpanded}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex items-center justify-between">
                    <CardTitle>Quy định sân</CardTitle>
                    <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                        }`} 
                    />
                </div>
            </CardHeader>
            {isExpanded && (
                <>
                <hr className="border-t border-gray-300 my-0 mx-6" />
                <CardContent className="pt-6 space-y-6">
                <Input placeholder="Nhập quy định" />
                <Button variant="link" className="text-red-600 p-0">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm quy định
                </Button>
                </CardContent>
                </>
            )}
        </Card>
    );
}
