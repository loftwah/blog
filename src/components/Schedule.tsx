import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { DateTime } from 'luxon';

// =============================================================================
// Types & Interfaces
// =============================================================================

type AvailabilityType = 'unavailable' | 'flexible' | 'available';
// Allowed day indices: 0 = Monday, …, 6 = Sunday
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

// =============================================================================
// Data & Helper Functions
// =============================================================================

const schedules: Record<DayIndex, ScheduleEntry> = {
  0: {
    blockedTimes: [
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  1: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  2: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '13:30', end: '14:30', type: 'unavailable', label: 'Meeting' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  3: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  4: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '23:00'
  },
  5: {
    blockedTimes: [
      { start: '08:00', end: '09:00', type: 'unavailable', label: 'School drop-off' },
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '24:00'
  },
  6: {
    blockedTimes: [
      { start: '09:00', end: '09:30', type: 'unavailable', label: 'Dog walking' },
      { start: '09:30', end: '11:30', type: 'flexible', label: 'Exercise/shower' },
      { start: '17:00', end: '17:30', type: 'unavailable', label: 'Dog walking' }
    ],
    availableStart: '10:00',
    availableEnd: '24:00'
  }
};

const statusLabels: Record<AvailabilityType, string> = {
  unavailable: 'Busy',
  flexible: 'Tentative',
  available: 'Available'
};

const getAllTimezones = (): string[] => {
  let allTimezones: string[] = [];
  if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
    try {
      allTimezones = Intl.supportedValuesOf('timeZone');
    } catch (error) {
      // fallback below if needed
    }
  }
  if (allTimezones.length === 0) {
    allTimezones = [
      'Africa/Abidjan',
      'Africa/Accra',
      'Africa/Cairo',
      'Africa/Casablanca',
      'Africa/Johannesburg',
      'America/Anchorage',
      'America/Argentina/Buenos_Aires',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/New_York',
      'America/Sao_Paulo',
      'Asia/Dubai',
      'Asia/Hong_Kong',
      'Asia/Kolkata',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Australia/Adelaide',
      'Australia/Brisbane',
      'Australia/Darwin',
      'Australia/Melbourne',
      'Australia/Sydney',
      'Europe/Berlin',
      'Europe/London',
      'Europe/Moscow',
      'UTC'
    ];
  }
  return allTimezones.sort();
};

const getAvailability = (time: DateTime): AvailabilityType => {
  const timeInAEST: DateTime = time.setZone('Australia/Melbourne');
  const dayNumber: DayIndex = (timeInAEST.weekday % 7) as DayIndex;
  const timeString: string = timeInAEST.toFormat('HH:mm');

  const daySchedule: ScheduleEntry = schedules[dayNumber];
  for (const block of daySchedule.blockedTimes) {
    if (timeString >= block.start && timeString < block.end) {
      return block.type;
    }
  }
  if (timeString >= daySchedule.availableStart && timeString < daySchedule.availableEnd) {
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

// =============================================================================
// Sub-Components
// =============================================================================

interface TimezoneSelectorProps {
  selectedTimezone: string;
  timezones: string[];
  timezoneFilter: string;
  onTimezoneChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  selectedTimezone,
  timezones,
  timezoneFilter,
  onTimezoneChange,
  onFilterChange
}) => {
  // Add handler for filter changes
  const handleFilterChange = (value: string) => {
    onFilterChange(value);
    
    // Get filtered timezones
    const filteredTimezones = timezones.filter((tz: string) =>
      tz.toLowerCase().includes(value.toLowerCase())
    );
    
    // If exactly one timezone matches, automatically select it
    if (filteredTimezones.length === 1) {
      onTimezoneChange(filteredTimezones[0]);
    }
  };

  return (
    <div>
      <label className="block mb-2">Select Timezone:</label>
      <input
        type="text"
        value={timezoneFilter}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange(e.target.value)}
        placeholder="Search timezones..."
        className="w-full border p-2 rounded mb-2"
      />
      <select
        value={selectedTimezone}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onTimezoneChange(e.target.value)}
        className="w-full border p-2 rounded"
      >
        {timezones
          .filter((tz: string) =>
            tz.toLowerCase().includes(timezoneFilter.toLowerCase())
          )
          .map((tz: string) => (
            <option key={tz} value={tz}>
              {formatTimezone(tz)}
            </option>
          ))}
      </select>
    </div>
  );
};

interface DaySelectorProps {
  dayNames: readonly string[];
  selectedDay: number;
  onSelect: (index: number) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ dayNames, selectedDay, onSelect }) => (
  <div className="mb-6">
    <label className="block mb-2">Select Day:</label>
    <div className="flex flex-wrap gap-2">
      {dayNames.map((day: string, index: number) => (
        <button
          key={day}
          onClick={() => onSelect(index)}
          type="button"
          className={`px-4 py-2 rounded ${
            selectedDay === index
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          } ${[5, 6].includes(index) ? 'border-l-4 border-purple-500' : ''}`}
        >
          {day}
        </button>
      ))}
    </div>
  </div>
);

const ScheduleHeader: React.FC = () => (
  <div className="grid grid-cols-4 gap-1 mb-2 font-medium bg-gray-100 p-2 rounded hidden md:grid">
    <div>Melbourne Time</div>
    <div>Local Time</div>
    <div>Status</div>
    <div>Notes</div>
  </div>
);

interface ScheduleRowProps {
  melbourneTime: DateTime;
  localTime: DateTime;
  availability: AvailabilityType;
  statusLabel: string;
  block: BlockedTime | undefined;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  melbourneTime,
  localTime,
  availability,
  statusLabel,
  block
}) => (
  <div
    className={`p-2 rounded ${
      availability === 'unavailable'
        ? 'bg-red-200'
        : availability === 'flexible'
        ? 'bg-yellow-200'
        : 'bg-green-200'
    }`}
  >
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
        {statusLabel}
      </div>
      <div className="text-sm md:text-base break-words">
        <span className="md:hidden font-bold">Note: </span>
        {block?.label || ''}
      </div>
    </div>
  </div>
);

// =============================================================================
// Main Component
// =============================================================================

const Schedule: React.FC = () => {
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Australia/Melbourne');
  const [timezones, setTimezones] = useState<string[]>([]);
  const [timezoneFilter, setTimezoneFilter] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<DateTime | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  useEffect(() => {
    const now = DateTime.now();
    setCurrentTime(now);
    setSelectedDay((now.weekday - 1) % 7);
    
    const userTimezone = DateTime.local().zoneName;
    setSelectedTimezone(userTimezone || 'Australia/Melbourne');

    const allTimezones = getAllTimezones();
    setTimezones(allTimezones);

    const timer = window.setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return <div>Loading...</div>;
  }

  const dayNames: readonly string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Availability Schedule</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimezoneSelector
          selectedTimezone={selectedTimezone}
          timezones={timezones}
          timezoneFilter={timezoneFilter}
          onTimezoneChange={setSelectedTimezone}
          onFilterChange={setTimezoneFilter}
        />
        <div className="space-y-2">
          <p className="font-medium">Current Times:</p>
          <p>Your timezone: {currentTime.setZone(selectedTimezone).toFormat('fff')}</p>
          <p>Melbourne: {currentTime.setZone('Australia/Melbourne').toFormat('fff')}</p>
        </div>
      </div>

      <DaySelector dayNames={dayNames} selectedDay={selectedDay} onSelect={setSelectedDay} />

      {/* Header visible on medium screens and up */}
      <ScheduleHeader />

      <div className="space-y-1">
        {Array.from({ length: 48 }).map((_, index: number) => {
          // Adjust selectedDay to Luxon weekday (Monday = 1, Sunday = 7)
          const luxonWeekday: 1 | 2 | 3 | 4 | 5 | 6 | 7 =
            selectedDay === 6 ? 7 : (selectedDay + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
          const baseTime: DateTime = DateTime.now()
            .startOf('day')
            .plus({ minutes: index * 30 })
            .set({ weekday: luxonWeekday });
          const localTime: DateTime = baseTime.setZone(selectedTimezone);
          const melbourneTime: DateTime = baseTime.setZone('Australia/Melbourne');
          const availability: AvailabilityType = getAvailability(baseTime);
          const statusLabel: string = statusLabels[availability];
          // Compute the day index based on Melbourne time (using modulo for our schedules)
          const dayIdx: DayIndex = (melbourneTime.weekday % 7) as DayIndex;
          const block: BlockedTime | undefined = schedules[dayIdx].blockedTimes.find(
            (b: BlockedTime) =>
              melbourneTime.toFormat('HH:mm') >= b.start &&
              melbourneTime.toFormat('HH:mm') < b.end
          );
          return (
            <ScheduleRow
              key={index}
              melbourneTime={melbourneTime}
              localTime={localTime}
              availability={availability}
              statusLabel={statusLabel}
              block={block}
            />
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
                <span>Busy (Blocked)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-200 mr-3 rounded"></div>
                <span>Tentative (Preferred to avoid)</span>
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
