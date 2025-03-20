import TextInput from '@/Components/TextInput';

const PairScoreInput = ({ segmentId, criterion, value, onChange, disabled, gender }) => {
    return (
        <div className="flex flex-col items-center">
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-3">
                {criterion.criteria_name} ({`${Math.round(criterion.weight)}%`}) ({gender})
            </span>
            <TextInput
                type="number"
                min="0"
                max="10"
                step="0.1"
                className="transition-transform focus:scale-105 w-full md:w-64 px-4 py-3 md:px-6 md:py-4 border-2 border-indigo-500 rounded text-center text-2xl md:text-3xl focus:ring-2 focus:ring-indigo-500 placeholder:text-sm"
                value={value || ''}
                placeholder="Enter score"
                onChange={(e) => onChange(segmentId, criterion.id, e.target.value)}
                disabled={disabled}
                aria-label={`Score for ${criterion.criteria_name}`}
            />
        </div>
    );
};

export default PairScoreInput;