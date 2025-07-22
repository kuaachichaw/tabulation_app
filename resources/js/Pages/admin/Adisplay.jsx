import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BiLogoSlack, 
  BiSolidUser, 
  BiCheck, 
  BiUserX, 
  BiArrowBack,
  BiCrown,
  BiUserVoice,
  BiPoll,
  BiAward,
  BiSave,
  BiLoaderAlt
} from "react-icons/bi";
import { HiUsers, HiViewGrid } from "react-icons/hi";

const DisplayModeToggle = ({ mode, description, active, icon, value, onClick, currentDisplayMode }) => {
  const isActiveInBothMode = currentDisplayMode === 2 && (value === 0 || value === 1);
  
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-full p-4 rounded-xl transition-all text-left group relative ${
        active || isActiveInBothMode
          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-200 dark:border-green-600'
          : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
      } shadow-sm hover:shadow-md`}
    >
      <div className="flex items-start space-x-4 pr-8">
        <div className={`p-3 rounded-lg mt-1 ${
          active || isActiveInBothMode
            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
        }`}>
          {icon}
        </div>
        <div>
          <h4 className={`font-semibold ${
            active || isActiveInBothMode
              ? 'text-green-800 dark:text-green-100' 
              : 'text-gray-700 dark:text-gray-200'
          }`}>
            {mode}
          </h4>
          <p className={`text-sm ${
            active || isActiveInBothMode
              ? 'text-green-600 dark:text-green-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {description}
          </p>
        </div>
      </div>
      <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
        active || isActiveInBothMode
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 dark:bg-gray-500 text-transparent'
      }`}>
        <BiCheck className="text-lg" />
      </div>
    </button>
  );
};

const DisplayOptionCard = ({ option, isSelected, onClick, currentMode }) => {
  const icons = {
    1: <BiCrown className="text-xl" />,
    2: <BiUserVoice className="text-xl" />,
    3: <HiViewGrid className="text-xl" />,
    4: <BiPoll className="text-xl" />
  };

  const modeLabels = {
    0: 'Solo',
    1: 'Pair',
    2: 'Both'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl transition-all text-left ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-600'
          : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
      } shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${
            isSelected
              ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
              : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
          }`}>
            {icons[option.id] || <BiAward className="text-xl" />}
          </div>
          <h4 className={`font-semibold ${
            isSelected
              ? 'text-indigo-800 dark:text-indigo-100' 
              : 'text-gray-700 dark:text-gray-200'
          }`}>
            {option.name}
          </h4>
        </div>
        {currentMode !== null && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            isSelected 
              ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            {modeLabels[currentMode]}
          </span>
        )}
      </div>
    </button>
  );
};

export default function DisplayController() {
    const displayOptions = [
        { id: 1, name: 'Leaderboard', key: 'Display_Leaderboard' },
        { id: 2, name: 'Candidate', key: 'Display_Candidate' },
        { id: 3, name: 'Segment', key: 'Display_Segment' },
        { id: 4, name: 'Scoring', key: 'Display_Scoring' }
    ];

    const [displaySettings, setDisplaySettings] = useState({
        Display_Leaderboard: null,
        Display_Candidate: null,
        Display_Segment: null,
        Display_Scoring: null
    });
    
    const [selectedOption, setSelectedOption] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const displayModes = [
      {
        mode: "Solo Candidate",
        description: "Display Solo Candidates",
        icon: <BiSolidUser />,
        value: 0
      },
      {
        mode: "Pair Candidate",
        description: "Display Pair Candidates",
        icon: <HiUsers />,
        value: 1
      },
      {
        mode: "Solo / Pair",
        description: "Display both Solo and Paired Candidates",
        icon: <BiLogoSlack />,
        value: 2
      }
    ];

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        
        const fetchDisplaySettings = async () => {
            try {
                const response = await axios.get('/display/get');
                if (response.data.error) {
                    console.error('Server error:', response.data.error);
                    toast.error('Failed to load settings. Using defaults.');
                    setDisplaySettings({
                        Display_Leaderboard: 0,
                        Display_Candidate: 0,
                        Display_Segment: 0,
                        Display_Scoring: 0
                    });
                } else {
                    setDisplaySettings(response.data);
                }
            } catch (error) {
                console.error('Network error:', error);
                toast.error('Connection error. Using default settings.');
                setDisplaySettings({
                    Display_Leaderboard: 0,
                    Display_Candidate: 0,
                    Display_Segment: 0,
                    Display_Scoring: 0
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        fetchDisplaySettings();

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const handleDisplayModeChange = (value) => {
        if (!selectedOption) return;
        const currentOption = displayOptions.find(opt => opt.id === selectedOption);
        if (currentOption) {
            setDisplaySettings(prev => ({
                ...prev,
                [currentOption.key]: value
            }));
        }
    };

    const getCurrentDisplayMode = () => {
        if (!selectedOption) return null;
        const currentOption = displayOptions.find(opt => opt.id === selectedOption);
        return displaySettings[currentOption.key];
    };

    const handleSave = async () => {
        const hasUnsetValues = displayOptions.some(option => {
            const value = displaySettings[option.key];
            return value === undefined || value === null;
        });

        if (hasUnsetValues) {
            toast.error('Please select display modes for all options');
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.post('/display/save', displaySettings);
            toast.success(response.data.message);
            console.log('Settings saved:', displaySettings);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout header={
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Display Controller</h2>
                </div>
            }>
                <div className="flex items-center justify-center h-64">
                    <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout header={
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()} 
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Go back"
            >
              <BiArrowBack className="text-xl" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Display Controller</h2>
          </div>
        }>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 flex items-center">
                            <HiViewGrid className="mr-2" />
                            Display Options
                        </h3>
                        <div className="space-y-3">
                            {displayOptions.map((option) => (
                                <DisplayOptionCard
                                    key={option.id}
                                    option={option}
                                    isSelected={selectedOption === option.id}
                                    currentMode={displaySettings[option.key]}
                                    onClick={() => setSelectedOption(option.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Button */}
                {isSmallScreen && (
                    <>
                        <button
                            className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all duration-300 z-40"
                            onClick={() => setIsModalOpen(true)}
                            aria-label="Open display options"
                        >
                            <BiLogoSlack className="text-2xl" />
                        </button>

                        {isModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div 
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                                            <HiViewGrid className="mr-2" />
                                            Select Display
                                        </h3>
                                        <button
                                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setIsModalOpen(false)}
                                            aria-label="Close modal"
                                        >
                                            <BiUserX className="text-xl" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {displayOptions.map((option) => (
                                            <DisplayOptionCard
                                                key={option.id}
                                                option={option}
                                                isSelected={selectedOption === option.id}
                                                currentMode={displaySettings[option.key]}
                                                onClick={() => {
                                                    setSelectedOption(option.id);
                                                    setIsModalOpen(false);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Main Content */}
                <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                    {selectedOption ? (
                        <>
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/10 border-b border-indigo-100 dark:border-indigo-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="p-3 mr-4 bg-indigo-100 dark:bg-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-300">
                                            {selectedOption === 1 && <BiCrown className="text-2xl" />}
                                            {selectedOption === 2 && <BiUserVoice className="text-2xl" />}
                                            {selectedOption === 3 && <HiViewGrid className="text-2xl" />}
                                            {selectedOption === 4 && <BiPoll className="text-2xl" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Active Display</p>
                                            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                                                {displayOptions.find(d => d.id === selectedOption)?.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-100 dark:bg-indigo-800/30 px-3 py-1 rounded-full text-indigo-800 dark:text-indigo-200 font-medium">
                                        Current: {displayModes.find(m => m.value === getCurrentDisplayMode())?.mode || 'Not set'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700/20 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                        <BiAward className="mr-2" />
                                        Presentation Mode
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        This display will appear on the judge's screen
                                    </p>
                                    <div className="space-y-3">
                                        {displayModes.map((mode) => (
                                            <DisplayModeToggle
                                                key={mode.value}
                                                mode={mode.mode}
                                                description={mode.description}
                                                icon={mode.icon}
                                                active={getCurrentDisplayMode() === mode.value}
                                                currentDisplayMode={getCurrentDisplayMode()}
                                                onClick={handleDisplayModeChange}
                                                value={mode.value}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/20 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                Status
                                            </h4>
                                            <p className={`text-lg font-medium ${
                                                getCurrentDisplayMode() !== null && getCurrentDisplayMode() !== undefined
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {getCurrentDisplayMode() !== null && getCurrentDisplayMode() !== undefined 
                                                    ? 'Ready to display' 
                                                    : 'Select a display mode'}
                                            </p>
                                        </div>
                                        <button 
                                            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                                                (getCurrentDisplayMode() !== null && getCurrentDisplayMode() !== undefined)
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-200/50 hover:from-green-600 hover:to-green-700'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                                            }`}
                                            disabled={getCurrentDisplayMode() === null || getCurrentDisplayMode() === undefined || isSaving}
                                            onClick={handleSave}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <BiLoaderAlt className="animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Save</span>
                                                    <BiSave className="text-xl" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                <BiUserX className="text-5xl text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                                No Display Selected
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Please select a display option from the sidebar to begin configuration
                            </p>
                            {isSmallScreen && (
                                <button
                                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Select Display Option
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={3000} />
        </AdminLayout>
    );
}