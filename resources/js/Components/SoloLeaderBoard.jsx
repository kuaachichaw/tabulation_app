import { motion } from 'framer-motion';

export const SoloLeaderBoard = ({ leaderboard = [], isOverall }) => {
  // Ensure leaderboard is always an array
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  
  // ========================
  // Podium Display Component
  // ========================
  const PodiumDisplay = ({ winners }) => {
    // Return null if no winners to prevent errors
    if (!winners || winners.length === 0) return null;

    // Helper component for judge scores
    const JudgeScores = ({ scores }) => (
      <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 mx-4">
        {scores?.map((judge) => (
          <p key={judge.judge_id} className="text-center">
            <span>{judge.judge}: </span>
            <span>{judge.judge_total}%</span>
          </p>
        ))}
      </div>
    );

    // Helper component for overall scores
    const OverallScoreDisplay = ({ segments, totalScore }) => (
      <div className="flex flex-col items-center flex-1 mx-4">
        {segments?.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {segments.map((segment, index) => (
              <p key={index}>
                <strong>{segment.segment_name}:</strong> {segment.weighted_contribution}%
              </p>
            ))}
          </div>
        )}
        <p className="font-bold text-lg text-gray-900 dark:text-white">
          {parseFloat(totalScore?.replace('%', '') || 0).toFixed(2)}%
        </p>
      </div>
    );

    return (
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-12">
        {winners.map((candidate, index) => (
          <motion.div
            key={candidate.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
            style={{ minWidth: index === 0 ? "120px" : "100px" }}
          >
            <div className="relative">
              {candidate.picture && (
                <img
                  src={`/storage/${candidate.picture}`}
                  alt={candidate.name || 'Candidate'}
                  className="w-30 h-35 rounded-full object-cover border-4 border-white"
                />
              )}
              <span className="badgeBounce absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg px-8 py-3 rounded-full">
                {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
              </span>
            </div>
            <h4 className="text-gray-900 dark:text-white text-lg font-bold mt-2">
              {candidate.name || 'Unknown Candidate'}
            </h4>
            {!isOverall && candidate.judge_scores && (
              <JudgeScores scores={candidate.judge_scores} />
            )}
            {isOverall ? (
              <OverallScoreDisplay 
                segments={candidate.segments} 
                totalScore={candidate.total_score} 
              />
            ) : (
              <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                Total Score: {candidate.judge_score || '0'}%
              </p>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // ========================
  // Contestant List Component
  // ========================
  const ContestantList = ({ contestants = [], isOverall }) => {
    // Return null if no contestants to prevent errors
    if (!contestants || contestants.length === 0) return null;

    // Helper component for judge scores
    const JudgeScores = ({ scores }) => (
      <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 mx-4">
        {scores?.map((judge) => (
          <p key={judge.judge_id} className="text-center">
            <span>{judge.judge}: </span>
            <span>{judge.judge_total}%</span>
          </p>
        ))}
      </div>
    );
  
    // Updated OverallScoreDisplay to be centered
    const OverallScoreDisplay = ({ segments }) => (
      <div className="flex-1 px-4 text-center">
        {segments?.map((segment, index) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{segment.segment_name}:</strong> {segment.weighted_contribution}%
          </p>
        ))}
      </div>
    );
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {isOverall ? 'Overall Rankings' : 'Other Contestants'}
        </h3>
        <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {contestants.map((candidate, index) => (
            <li key={candidate.id || index} className="flex flex-col p-3 border-b last:border-b-0">
              <div className="flex flex-col md:flex-row items-center justify-between">
                {/* Candidate Info (Left-aligned) */}
                <div className="flex items-center min-w-[200px]">
                  <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">
                    {index + (isOverall ? 1 : 4)}.
                  </span>
                  {candidate.picture && (
                    <img 
                      src={`/storage/${candidate.picture}`} 
                      alt={candidate.name || 'Candidate'} 
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mr-3" 
                    />
                  )}
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {candidate.name || 'Unknown Candidate'}
                  </span>
                </div>
  
                {/* Middle Section - Centered Content */}
                {isOverall ? (
                  candidate.segments && <OverallScoreDisplay segments={candidate.segments} />
                ) : (
                  candidate.judge_scores && <JudgeScores scores={candidate.judge_scores} />
                )}
  
                {/* Total Score (Right-aligned) */}
                <div className="min-w-[80px] text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {isOverall
                      ? `${parseFloat(candidate.total_score || 0).toFixed(2)}%`
                      : `${candidate.judge_score || '0'}%`}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Don't forget to pass isOverall prop when using ContestantList:
  return (
    <>
      <PodiumDisplay winners={safeLeaderboard.slice(0, 3)} />
      <ContestantList contestants={safeLeaderboard.slice(3)} isOverall={isOverall} />
    </>
  );
};