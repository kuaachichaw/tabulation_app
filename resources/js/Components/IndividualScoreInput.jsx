import TextInput from '@/Components/TextInput';

const IndividualScoreInput = ({ segmentId, criterion, value, onChange, disabled }) => {
    // Convert empty string to undefined to distinguish between "no value" and "0"
    const displayValue = value === undefined ? '' : value;

    return (
        <div className="flex flex-col items-center">
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-3">
                {criterion.name} ({`${Math.round(criterion.weight)}%`})
            </span>
            <TextInput
                type="number"
                min="1"
                max="10"
                step="0.1"
                className="transition-transform focus:scale-105 w-full md:w-64 px-4 py-3 md:px-6 md:py-4 border-2 border-indigo-500 rounded text-center text-2xl md:text-3xl focus:ring-2 focus:ring-indigo-500 placeholder:text-sm"
                value={displayValue}
                placeholder="Enter score"
                onChange={(e) => {
                    const val = e.target.value;
                    // Explicitly handle empty string and valid numbers
                    onChange(segmentId, criterion.id, val === '' ? undefined : val);
                }}
                disabled={disabled}
                aria-label={`Score for ${criterion.name}`}
            />
        </div>
    );
};

export default IndividualScoreInput;