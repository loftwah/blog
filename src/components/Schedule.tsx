import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

type AvailabilityType = 'unavailable' | 'flexible' | 'available';
type DayType = 'weekday' | 'weekend';

interface TimeBlock {
  start: string;
  end: string;
  type: AvailabilityType;
  label?: string;
}

interface AvailabilityWindow {
  start: string;
  end: string;
  days: number[]; // 0-6, where 0 is Sunday
}

const Schedule: React.FC = () => {
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Australia/Melbourne');
  const [timezones, setTimezones] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
  const defaultUIIndex = DateTime.now().weekday === 7 ? 6 : DateTime.now().weekday - 1;
  const [selectedDay, setSelectedDay] = useState<number>(defaultUIIndex);

  const schedules = {
    // SUNDAY (0)
    0: {
      blockedTimes: [
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '23:00'  // 11pm finish (Sun-Thurs)
    },
    // MONDAY (1)
    1: {
      blockedTimes: [
        { start: '08:00', end: '09:00', type: 'unavailable' as const, label: 'School drop-off' },
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '23:00'  // 11pm finish (Sun-Thurs)
    },
    // TUESDAY (2)
    2: {
      blockedTimes: [
        { start: '08:00', end: '09:00', type: 'unavailable' as const, label: 'School drop-off' },
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '23:00'  // 11pm finish (Sun-Thurs)
    },
    // WEDNESDAY (3)
    3: {
      blockedTimes: [
        { start: '08:00', end: '09:00', type: 'unavailable' as const, label: 'School drop-off' },
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '23:00'  // 11pm finish (Sun-Thurs)
    },
    // THURSDAY (4)
    4: {
      blockedTimes: [
        { start: '08:00', end: '09:00', type: 'unavailable' as const, label: 'School drop-off' },
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '23:00'  // 11pm finish (Sun-Thurs)
    },
    // FRIDAY (5)
    5: {
      blockedTimes: [
        { start: '08:00', end: '09:00', type: 'unavailable' as const, label: 'School drop-off' },
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '24:00'  // Midnight finish (Fri-Sat)
    },
    // SATURDAY (6)
    6: {
      blockedTimes: [
        { start: '09:00', end: '09:30', type: 'unavailable' as const, label: 'Dog walking' },
        { start: '09:30', end: '11:30', type: 'flexible' as const, label: 'Exercise/shower' }
      ],
      availableStart: '10:00',
      availableEnd: '24:00'  // Midnight finish (Fri-Sat)
    }
  } as const;

  // Expanded timezone list
  useEffect(() => {
    const userTimezone: string | null = DateTime.local().zoneName;
    setSelectedTimezone(userTimezone || 'Australia/Melbourne');
    
    // Expanded list of common timezones
    const commonTimezones = [
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
      'Pacific/Auckland',
    ];
    setTimezones(commonTimezones);

    // Update current time every minute
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
    const dayOfWeek: number = timeInAEST.weekday % 7; // 0-6
    const timeString: string = timeInAEST.toFormat('HH:mm');
    
    // Get the schedule for this specific day
    const daySchedule = schedules[dayOfWeek].blockedTimes;

    // Check blocked times for this day
    for (const block of daySchedule) {
      if (timeString >= block.start && timeString < block.end) {
        return block.type;
      }
    }

    // Check if within available hours for this day
    if (timeString >= schedules[dayOfWeek].availableStart && timeString < schedules[dayOfWeek].availableEnd) {
      return 'available';
    }

    return 'unavailable';
  };

  const getBlockColor = (type: AvailabilityType): string => {
    switch (type) {
      case 'unavailable':
        return 'bg-red-200';
      case 'flexible':
        return 'bg-yellow-200';
      case 'available':
        return 'bg-green-200';
    }
  };

  // Helper function to format timezone for display
  const formatTimezone = (tz: string): string => {
    const now: DateTime = DateTime.now().setZone(tz);
    const offset: string = now.toFormat('ZZ');
    const abbr: string = now.toFormat('ZZZZ');
    return `${tz.replace('_', ' ')} (${abbr} ${offset})`;
  };

  const dayNames: readonly string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ] as const;

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

      <div className="grid grid-cols-4 gap-1 mb-2 font-medium bg-gray-100 p-2 rounded">
        <div>Melbourne Time</div>
        <div>Local Time</div>
        <div>Status</div>
        <div>Notes</div>
      </div>

      <div className="space-y-1">
        {Array.from({ length: 48 }).map((_, index) => {
          // Convert selectedDay to Luxon weekday, adjusting for Sunday.
          const luxonWeekday = selectedDay === 6 ? 7 : selectedDay + 1;
          
          const time = DateTime.now()
            .startOf('day')
            .plus({ minutes: index * 30 })
            .set({ weekday: luxonWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7 });
          
          const localTime = time.setZone(selectedTimezone);
          const melbourneTime = time.setZone('Australia/Melbourne');
          const status = isAvailable(time);
          const block = schedules[time.weekday % 7].blockedTimes.find(b => 
            melbourneTime.toFormat('HH:mm') >= b.start && 
            melbourneTime.toFormat('HH:mm') < b.end
          );
          
          return (
            <div
              key={index}
              className={`grid grid-cols-4 gap-1 p-2 rounded items-center ${getBlockColor(status)}`}
            >
              <div>{melbourneTime.toFormat('HH:mm')}</div>
              <div>{localTime.toFormat('HH:mm')}</div>
              <div className="capitalize">{status}</div>
              <div>{block?.label || ''}</div>
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