import TextInput from '@/Components/TextInput';

const SoloScoreInput = ({ segmentId, criterion, value, onChange, disabled }) => {
    // Convert "0" to empty string for better UX, but keep undefined as empty
    const displayValue = value === '0' ? '' : value || '';

    return (
        <div className="flex flex-col items-center">
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-3">
                {criterion.name} ({`${Math.round(criterion.weight)}%`})
            </span>
            <TextInput
                type="number"
                min="0"
                max="10"
                step="0.1"
                className="transition-transform focus:scale-105 w-full md:w-64 px-4 py-3 md:px-6 md:py-4 border-2 border-indigo-500 rounded text-center text-2xl md:text-3xl focus:ring-2 focus:ring-indigo-500 placeholder:text-sm"
                value={displayValue}
                placeholder="Enter Score"
                onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty string, will be converted to 0 in handler
                    onChange(segmentId, criterion.id, val);
                }}
                onBlur={(e) => {
                    // If empty after blur, set to 0
                    if (e.target.value === '') {
                        onChange(segmentId, criterion.id, '0');
                    }
                }}
                disabled={disabled}
                aria-label={`Score for ${criterion.name}`}
            />
        </div>
    );
};

export default SoloScoreInput;