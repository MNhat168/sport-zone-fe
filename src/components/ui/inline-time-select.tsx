import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';

export interface InlineTimeSelectProps {
  label?: string;
  value: string; // format HH:MM
  onChange: (value: string) => void;
  minuteStep?: number; // default 5
  className?: string;
}

export function InlineTimeSelect({ label, value, onChange, minuteStep = 5, className }: InlineTimeSelectProps) {
  const [h = '00', m = '00'] = (value || '').split(':');

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
  const minutes = useMemo(() => {
    const step = Math.max(1, Math.min(30, minuteStep));
    const arr: string[] = [];
    for (let i = 0; i < 60; i += step) arr.push(String(i).padStart(2, '0'));
    return arr;
  }, [minuteStep]);

  const handleHour = (newH: string) => onChange(`${newH}:${m || '00'}`);
  const handleMinute = (newM: string) => onChange(`${h || '00'}:${newM}`);

  return (
    <div className={className ? className : ''}>
      {label && <Label>{label}</Label>}
      <div className="mt-1.5 grid grid-cols-2 gap-2 items-center">
        <Select value={h} onValueChange={handleHour}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Giờ" />
          </SelectTrigger>
          <SelectContent className="max-h-60 bg-white">
            {hours.map((hh) => (
              <SelectItem key={hh} value={hh}>{hh}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={m} onValueChange={handleMinute}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Phút" />
          </SelectTrigger>
          <SelectContent className="max-h-60 bg-white">
            {minutes.map((mm) => (
              <SelectItem key={mm} value={mm}>{mm}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default InlineTimeSelect;


