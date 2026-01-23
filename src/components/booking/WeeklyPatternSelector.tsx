import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WeeklyPatternSelectorProps {
    selectedWeekdays: string[];
    numberOfWeeks: number;
    startDate: string;
    onWeekdaysChange: (weekdays: string[]) => void;
    onNumberOfWeeksChange: (weeks: number) => void;
    onStartDateChange: (date: string) => void;
}

const WEEKDAYS = [
    { value: 'monday', label: 'Thứ 2', short: 'T2' },
    { value: 'tuesday', label: 'Thứ 3', short: 'T3' },
    { value: 'wednesday', label: 'Thứ 4', short: 'T4' },
    { value: 'thursday', label: 'Thứ 5', short: 'T5' },
    { value: 'friday', label: 'Thứ 6', short: 'T6' },
    { value: 'saturday', label: 'Thứ 7', short: 'T7' },
    { value: 'sunday', label: 'Chủ nhật', short: 'CN' },
];

export const WeeklyPatternSelector: React.FC<WeeklyPatternSelectorProps> = ({
    selectedWeekdays,
    numberOfWeeks,
    startDate,
    onWeekdaysChange,
    onNumberOfWeeksChange,
    onStartDateChange,
}) => {
    const [open, setOpen] = useState(false);

    const handleWeekdayToggle = (weekday: string) => {
        if (selectedWeekdays.includes(weekday)) {
            onWeekdaysChange(selectedWeekdays.filter(d => d !== weekday));
        } else {
            onWeekdaysChange([...selectedWeekdays, weekday]);
        }
    };

    // Calculate min date (today)
    const minDate = useMemo(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }, []);

    // Calculate max date (3 months from today)
    const maxDate = useMemo(() => {
        const today = new Date();
        today.setMonth(today.getMonth() + 3);
        return today.toISOString().split('T')[0];
    }, []);

    return (
        <div className="space-y-4">
            {/* Weekday Selector */}
            <div className="space-y-2.5">
                <Label className="text-sm font-medium text-blue-700">Chọn các ngày trong tuần</Label>
                <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day) => (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => handleWeekdayToggle(day.value)}
                            className={`
                                px-3 py-2 rounded-md text-sm font-medium transition-colors border
                                ${selectedWeekdays.includes(day.value)
                                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                    : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                }
                            `}
                            aria-pressed={selectedWeekdays.includes(day.value)}
                        >
                            <span className="hidden sm:inline">{day.label}</span>
                            <span className="sm:hidden">{day.short}</span>
                        </button>
                    ))}
                </div>
                {selectedWeekdays.length === 0 && (
                    <p className="text-sm text-red-600">Vui lòng chọn ít nhất 1 ngày trong tuần</p>
                )}
            </div>

            {/* Number of Weeks Selector */}
            <div className="space-y-2.5">
                <Label className="text-sm font-medium text-blue-700">Số tuần</Label>
                <input
                    type="number"
                    min={1}
                    max={2}
                    value={numberOfWeeks}
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) {
                            onNumberOfWeeksChange(1);
                        } else if (value > 2) {
                            onNumberOfWeeksChange(2);
                        } else {
                            onNumberOfWeeksChange(value);
                        }
                    }}
                    onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) {
                            onNumberOfWeeksChange(1);
                        } else if (value > 2) {
                            onNumberOfWeeksChange(2);
                        }
                    }}
                    className="w-full h-12 border-2 border-blue-200 rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
                    placeholder="Nhập số tuần (1-2)"
                />
                <p className="text-sm text-gray-500">Tối đa 2 tuần</p>
            </div>

            {/* Start Date Selector */}
            <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-700">Ngày bắt đầu (tuần đầu tiên)</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full h-12 justify-between font-normal border-gray-300 hover:border-blue-600 hover:bg-blue-50 data-[empty=true]:text-muted-foreground"
                            data-empty={!startDate}
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-blue-600" />
                                {startDate ? (
                                    <span className="text-gray-900">{format(new Date(startDate), 'dd/MM/yyyy', { locale: vi })}</span>
                                ) : (
                                    <span className="text-muted-foreground">Chọn ngày bắt đầu</span>
                                )}
                            </div>
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 bg-white border border-gray-200 shadow-lg" align="start">
                        <div className="p-2 border-b flex justify-end">
                            {startDate && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onStartDateChange('');
                                        setOpen(false);
                                    }}
                                    className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <Calendar
                            mode="single"
                            selected={startDate ? new Date(startDate) : undefined}
                            onSelect={(date) => {
                                if (date) {
                                    const offset = date.getTimezoneOffset();
                                    const correctedDate = new Date(date.getTime() - (offset * 60 * 1000));
                                    const dateStr = correctedDate.toISOString().split('T')[0];
                                    onStartDateChange(dateStr);
                                    setOpen(false); // Đóng popover sau khi chọn ngày
                                } else {
                                    // Explicitly reset when date is undefined/null (clicking selected date again)
                                    onStartDateChange('');
                                    setOpen(false);
                                }
                            }}
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const dateOnly = new Date(date);
                                dateOnly.setHours(0, 0, 0, 0);

                                // Disable dates before today
                                if (dateOnly < today) return true;

                                // Disable dates after maxDate
                                const maxDateObj = new Date(maxDate);
                                maxDateObj.setHours(23, 59, 59, 999);
                                if (dateOnly > maxDateObj) return true;

                                return false;
                            }}
                            captionLayout="dropdown"
                            fromDate={new Date(minDate)}
                            toDate={new Date(maxDate)}
                            initialFocus
                            classNames={{
                                today: "" // Loại bỏ highlight cho ngày hôm nay
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500">
                    Chọn ngày đầu tuần để bắt đầu Lịch định kỳ
                </p>
            </div>

            {/* Preview Summary */}
            {selectedWeekdays.length > 0 && numberOfWeeks > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                        Lịch định kỳ: Mỗi{' '}
                        {selectedWeekdays.map(day =>
                            WEEKDAYS.find(d => d.value === day)?.label
                        ).join(', ')}{' '}
                        trong {numberOfWeeks} tuần
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        ≈ {selectedWeekdays.length * numberOfWeeks} ngày sẽ được đặt
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeeklyPatternSelector;
