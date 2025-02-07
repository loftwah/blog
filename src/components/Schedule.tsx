import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

type AvailabilityType = 'unavailable' | 'flexible' | 'available';
type DayType = 'weekday' | 'weekend';

// Define the allowed day indices
type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface BlockedTime {
  start: string;
  end: string;
  type: AvailabilityType;
  label?: string;
}

interface ScheduleEntry {
  blockedTimes: BlockedTime[];
  availableStart: string;
  availableEnd: string;
}

const schedules: Record<DayIndex, ScheduleEntry> = {
  0: {
    blockedTimes: [
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  1: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  2: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '13:30', end: '14:30', type: 'unavailable', label: 'Meeting' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  3: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  4: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  5: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '24:00'
  },
  6: {
    blockedTimes: [
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' }
    ],
    availableStart: '10:00',
    availableEnd: '24:00'
  }
};

const Schedule: React.FC = () => {
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Australia/Melbourne');
  const [timezones, setTimezones] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
  const [selectedDay, setSelectedDay] = useState<number>((DateTime.now().weekday - 1) % 7);

  useEffect(() => {
    const userTimezone: string | null = DateTime.local().zoneName;
    setSelectedTimezone(userTimezone || 'Australia/Melbourne');
    
    const commonTimezones: string[] = [
      'Australia/Melbourne',
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Asia/Dubai',
      'Pacific/Auckland'
    ];
    setTimezones(commonTimezones);

    const timer: NodeJS.Timer = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getDayType = (dayOfWeek: number): DayType => {
    return [5, 6].includes(dayOfWeek) ? 'weekend' : 'weekday';
  };

  const isAvailable = (time: DateTime): AvailabilityType => {
    const timeInAEST: DateTime = time.setZone('Australia/Melbourne');
    const dayNumber: number = timeInAEST.weekday % 7;
    const dayIndex = dayNumber as DayIndex;
    const timeString: string = timeInAEST.toFormat('HH:mm');
    
    const daySchedule = schedules[dayIndex].blockedTimes;
    for (const block of daySchedule) {
      if (timeString >= block.start && timeString < block.end) {
        return block.type;
      }
    }

    if (
      timeString >= schedules[dayIndex].availableStart &&
      timeString < schedules[dayIndex].availableEnd
    ) {
      return 'available';
    }
    return 'unavailable';
  };

  const formatTimezone = (tz: string): string => {
    const now: DateTime = DateTime.now().setZone(tz);
    const offset: string = now.toFormat('ZZ');
    const abbr: string = now.toFormat('ZZZZ');
    return `${tz.replace('_', ' ')} (${abbr} ${offset})`;
  };

  const dayNames: readonly string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedTimezone(event.target.value);
  };

  const handleDaySelect = (index: number): void => {
    setSelectedDay(index);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Availability Schedule</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Select Timezone:</label>
          <select 
            value={selectedTimezone}
            onChange={handleTimezoneChange}
            className="w-full border p-2 rounded"
          >
            {timezones.map((tz: string) => (
              <option key={tz} value={tz}>{formatTimezone(tz)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Current Times:</p>
          <p>Your timezone: {currentTime.setZone(selectedTimezone).toFormat('fff')}</p>
          <p>Melbourne: {currentTime.setZone('Australia/Melbourne').toFormat('fff')}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2">Select Day:</label>
        <div className="flex flex-wrap gap-2">
          {dayNames.map((day: string, index: number) => (
            <button
              key={day}
              onClick={() => handleDaySelect(index)}
              type="button"
              className={`px-4 py-2 rounded ${
                selectedDay === index 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } ${
                getDayType(index) === 'weekend' 
                  ? 'border-l-4 border-purple-500' 
                  : ''
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Header for schedule rows (visible on md and up) */}
      <div className="grid grid-cols-4 gap-1 mb-2 font-medium bg-gray-100 p-2 rounded hidden md:grid">
        <div>Melbourne Time</div>
        <div>Local Time</div>
        <div>Status</div>
        <div>Notes</div>
      </div>

      <div className="space-y-1">
        {Array.from({ length: 48 }).map((_, index: number) => {
          // Adjust selectedDay to Luxon's weekday (1-7)
          const luxonWeekday = selectedDay === 6 ? 7 : selectedDay + 1;
          const time = DateTime.now()
            .startOf('day')
            .plus({ minutes: index * 30 })
            .set({ weekday: luxonWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7 });
          
          const localTime = time.setZone(selectedTimezone);
          const melbourneTime = time.setZone('Australia/Melbourne');
          const status: AvailabilityType = isAvailable(time);
          const dayIdx = (time.weekday % 7) as DayIndex;
          const block = schedules[dayIdx].blockedTimes.find(b =>
            melbourneTime.toFormat('HH:mm') >= b.start &&
            melbourneTime.toFormat('HH:mm') < b.end
          );
          
          return (
            <div
              key={index}
              className={`p-2 rounded ${
                status === 'unavailable'
                  ? 'bg-red-200'
                  : status === 'flexible'
                  ? 'bg-yellow-200'
                  : 'bg-green-200'
              }`}
            >
              {/* Responsive layout: stacked on mobile, grid on md+ */}
              <div className="block md:grid md:grid-cols-4 gap-1 items-center">
                <div className="text-sm md:text-base">
                  <span className="md:hidden font-bold">Melbourne: </span>
                  {melbourneTime.toFormat('HH:mm')}
                </div>
                <div className="text-sm md:text-base">
                  <span className="md:hidden font-bold">Local: </span>
                  {localTime.toFormat('HH:mm')}
                </div>
                <div className="capitalize text-sm md:text-base">
                  <span className="md:hidden font-bold">Status: </span>
                  {status}
                </div>
                <div className="text-sm md:text-base break-words">
                  <span className="md:hidden font-bold">Note: </span>
                  {block?.label || ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-bold mb-3">Schedule Information:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Availability Hours:</h3>
            <div className="ml-4 space-y-2">
              <p>📅 Sunday - Thursday: 10:00 AM - 11:00 PM AEST</p>
              <p>🌟 Friday - Saturday: 10:00 AM - 12:00 AM AEST</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Color Legend:</h3>
            <div className="grid gap-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-200 mr-3 rounded"></div>
                <span>Unavailable (Blocked)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-200 mr-3 rounded"></div>
                <span>Flexible (Preferred to avoid)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-200 mr-3 rounded"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule as unknown as astroHTML.JSX.Element;
