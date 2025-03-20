import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { DateTime } from 'luxon';
// Import FontAwesome components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDay, 
  faClock, 
  faLocationDot, 
  faCheck, 
  faXmark, 
  faRightLeft, 
  faInfoCircle, 
  faEnvelope, 
  faPalette, 
  faMessage,
  faCalendarAlt,
  faMobile
} from '@fortawesome/free-solid-svg-icons';
import { 
  faXTwitter, 
  faGithub,
  faBluesky,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';

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
    <div className="flex items-center">
      <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1 text-[var(--accent)]" />
      Melbourne Time
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1 text-[var(--accent)]" />
      Local Time
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3 mr-1 text-[var(--accent)]" />
      Status
    </div>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faMessage} className="h-3 w-3 mr-1 text-[var(--accent)]" />
      Notes
    </div>
  </div>
);

interface ScheduleRowProps {
  melbourneTime: DateTime;
  localTime: DateTime;
  availability: AvailabilityType;
  statusLabel: string;
  block: BlockedTime | undefined;
}

// Status icon helper function
const getStatusIcon = (status: AvailabilityType) => {
  switch (status) {
    case 'available':
      return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-1 text-green-500" />;
    case 'flexible':
      return <FontAwesomeIcon icon={faRightLeft} className="h-4 w-4 mr-1 text-yellow-500" />;
    case 'unavailable':
      return <FontAwesomeIcon icon={faXmark} className="h-4 w-4 mr-1 text-red-500" />;
    default:
      return null;
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
        <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1" />
        <span className="md:hidden font-bold">Melbourne: </span>
        {melbourneTime.toFormat('HH:mm')}
      </div>
      <div className="text-sm md:text-base font-medium text-[var(--accent-dark)] dark:text-[var(--accent)] flex items-center">
        <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1" />
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
            <FontAwesomeIcon icon={faMessage} className="h-4 w-4 mr-1 mt-0.5" />
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
      <div className="mb-6 p-6 bg-gray-800 dark:bg-gray-800 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-4 text-white border-b border-[var(--accent)] pb-2">
          Schedule a Time with Me
        </h1>
        
        <p className="mb-4">This tool helps you view my schedule and easily book a time with me. Please note that I prefer text-based communication and asynchronous interactions to ensure I can focus fully on the conversation's details. If we communicate in real time, I may be more focused on how I'm engaging rather than the specifics of the discussion.</p>
        
        <p className="mb-2">Feel free to reach out through any of the following:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li className="flex items-start">
            <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            Email: <a href="mailto:dean@deanlofts.xyz" className="ml-2 text-[var(--accent)] hover:underline">dean@deanlofts.xyz</a>
          </li>
          <li className="flex items-start">
            <FontAwesomeIcon icon={faMobile} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            Mobile: <a href="tel:+61423837782" className="ml-2 text-[var(--accent)] hover:underline">+61 423 837 782</a>
          </li>
          <li className="flex items-start">
            <FontAwesomeIcon icon={faBluesky} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            Bluesky: <a href="https://bsky.app/profile/loftwah.com" target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--accent)] hover:underline">bsky.app/profile/loftwah.com</a>
          </li>
          <li className="flex items-start">
            <FontAwesomeIcon icon={faGithub} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            GitHub: <a href="https://github.com/loftwah" target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--accent)] hover:underline">github.com/loftwah</a>
          </li>
          <li className="flex items-start">
            <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            LinkedIn: <a href="https://linkedin.com/in/deanlofts" target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--accent)] hover:underline">linkedin.com/in/deanlofts</a>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-[var(--accent)] fill-current mt-0.5 -ml-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 14l4-2.5-4-2.5v5z"></path>
              <path d="M12 5.75a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V6.5A.75.75 0 0 1 6 5.75h6Zm.75 1.5h3.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 1.5 0v2.75h7V8.75h-2.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
            Linkarooie: <a href="https://linkarooie.com/loftwah" target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--accent)] hover:underline">linkarooie.com/loftwah</a>
          </li>
          <li className="flex items-start">
            <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5 mr-2 text-[var(--accent)] mt-0.5 -ml-8" />
            Twitter/X: <a href="https://twitter.com/loftwah" target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--accent)] hover:underline">twitter.com/loftwah</a>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b-2 border-[var(--accent)] pb-2 flex items-center">
        <FontAwesomeIcon icon={faCalendarDay} className="h-6 w-6 mr-2 text-[var(--accent)]" />
        Your Availability Schedule
      </h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimezoneSelector
          selectedTimezone={selectedTimezone}
          timezones={timezones}
          timezoneFilter={timezoneFilter}
          onTimezoneChange={setSelectedTimezone}
          onFilterChange={setTimezoneFilter}
        />
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-[var(--accent)]">
          <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
            <FontAwesomeIcon icon={faClock} className="h-5 w-5 mr-1 text-[var(--accent)]" />
            Current Times:
          </p>
          <p className="text-gray-700 dark:text-gray-300 flex items-center pl-2">
            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 mr-1 text-[var(--accent-dark)] dark:text-[var(--accent)]" />
            Your timezone: {currentTime.setZone(selectedTimezone).toFormat('fff')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 flex items-center pl-2">
            <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 mr-1 text-[var(--accent-dark)] dark:text-[var(--accent)]" />
            Melbourne: {currentTime.setZone('Australia/Melbourne').toFormat('fff')}
          </p>
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
        <h2 className="font-bold mb-3 text-gray-900 dark:text-white border-b-2 border-[var(--accent)] pb-2 flex items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5 mr-1 text-[var(--accent)]" />
          Schedule Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-[var(--accent)] flex items-center">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1" />
              Availability Hours
            </h3>
            <div className="ml-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p>📅 Sunday - Thursday: 10:00 AM - 11:00 PM AEST</p>
              <p>🌟 Friday - Saturday: 10:00 AM - 12:00 AM AEST</p>
            </div>
          </div>
          <div className="space-y-4 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-[var(--accent)] flex items-center">
              <FontAwesomeIcon icon={faPalette} className="h-4 w-4 mr-1" />
              Color Legend
            </h3>
            <div className="grid gap-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-200 dark:bg-red-900/60 mr-3 rounded border border-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300 flex items-center">
                  {getStatusIcon('unavailable')}
                  Busy (Blocked)
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-200 dark:bg-yellow-900/60 mr-3 rounded border border-yellow-500"></div>
                <span className="text-gray-700 dark:text-gray-300 flex items-center">
                  {getStatusIcon('flexible')}
                  Tentative (Preferred to avoid)
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-200 dark:bg-green-900/60 mr-3 rounded border border-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300 flex items-center">
                  {getStatusIcon('available')}
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule as unknown as astroHTML.JSX.Element;
