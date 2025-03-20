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
    if (filteredTimezones.length === 1 && filteredTimezones[0]) {
      onTimezoneChange(filteredTimezones[0]);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-[var(--accent)]">
      <label className="block mb-2 text-gray-800 dark:text-gray-200 font-medium">Select Timezone:</label>
      <input
        type="text"
        value={timezoneFilter}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange(e.target.value)}
        placeholder="Search timezones..."
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      />
      <select
        value={selectedTimezone}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onTimezoneChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
      >
        {timezones
          .filter((tz: string) =>
            tz.toLowerCase().includes(timezoneFilter.toLowerCase())
          )
          .map((tz: string) => (
            <option key={tz} value={tz} className="text-gray-900 dark:text-gray-100">
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
    <label className="block mb-2 text-gray-800 dark:text-gray-200">Select Day:</label>
    <div className="flex flex-wrap gap-2">
      {dayNames.map((day: string, index: number) => (
        <button
          key={day}
          onClick={() => onSelect(index)}
          type="button"
          className={`px-4 py-2 rounded transition-colors ${
            selectedDay === index
              ? 'bg-[var(--accent)] text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          } ${[5, 6].includes(index) ? 'border-l-4 border-[var(--accent)]' : ''}`}
        >
          {day}
        </button>
      ))}
    </div>
  </div>
);

const ScheduleHeader: React.FC = () => (
  <div className="grid grid-cols-4 gap-1 mb-2 font-medium bg-gray-100 dark:bg-gray-800 p-2 rounded hidden md:grid text-gray-800 dark:text-gray-200 border-l-4 border-[var(--accent)]">
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

// Status icon mapping
const getStatusIcon = (availability: AvailabilityType) => {
  switch (availability) {
    case 'unavailable':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'flexible':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'available':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

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
        ? 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100 border-l-2 border-red-500'
        : availability === 'flexible'
        ? 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-100 border-l-2 border-yellow-500'
        : 'bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-100 border-l-2 border-green-500'
    }`}
  >
    <div className="block md:grid md:grid-cols-4 gap-1 items-center">
      <div className="text-sm md:text-base font-medium text-[var(--accent-dark)] dark:text-[var(--accent)] flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="md:hidden font-bold">Melbourne: </span>
        {melbourneTime.toFormat('HH:mm')}
      </div>
      <div className="text-sm md:text-base font-medium text-[var(--accent-dark)] dark:text-[var(--accent)] flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="md:hidden font-bold">Local: </span>
        {localTime.toFormat('HH:mm')}
      </div>
      <div className="capitalize text-sm md:text-base flex items-center">
        {getStatusIcon(availability)}
        <span className="md:hidden font-bold">Status: </span>
        {statusLabel}
      </div>
      <div className="text-sm md:text-base break-words flex items-start">
        {block?.label && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="md:hidden font-bold">Note: </span>
            <span>{block.label}</span>
          </>
        )}
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
    return <div className="text-gray-800 dark:text-gray-200">Loading...</div>;
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
    <div className="max-w-6xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b-2 border-[var(--accent)] pb-2">Your Availability Schedule</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimezoneSelector
          selectedTimezone={selectedTimezone}
          timezones={timezones}
          timezoneFilter={timezoneFilter}
          onTimezoneChange={setSelectedTimezone}
          onFilterChange={setTimezoneFilter}
        />
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-[var(--accent)]">
          <p className="font-medium text-gray-800 dark:text-gray-200">Current Times:</p>
          <p className="text-gray-700 dark:text-gray-300">Your timezone: {currentTime.setZone(selectedTimezone).toFormat('fff')}</p>
          <p className="text-gray-700 dark:text-gray-300">Melbourne: {currentTime.setZone('Australia/Melbourne').toFormat('fff')}</p>
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

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="font-bold mb-3 text-gray-900 dark:text-white border-b-2 border-[var(--accent)] pb-2">Schedule Information:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-[var(--accent)]">Availability Hours:</h3>
            <div className="ml-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p>📅 Sunday - Thursday: 10:00 AM - 11:00 PM AEST</p>
              <p>🌟 Friday - Saturday: 10:00 AM - 12:00 AM AEST</p>
            </div>
          </div>
          <div className="space-y-4 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-[var(--accent)]">Color Legend:</h3>
            <div className="grid gap-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-200 dark:bg-red-900/60 mr-3 rounded border border-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Busy (Blocked)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-200 dark:bg-yellow-900/60 mr-3 rounded border border-yellow-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Tentative (Preferred to avoid)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-200 dark:bg-green-900/60 mr-3 rounded border border-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule as unknown as astroHTML.JSX.Element;
