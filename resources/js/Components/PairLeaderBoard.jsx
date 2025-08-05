import { motion } from 'framer-motion';
import { FaFemale, FaMale } from "react-icons/fa";

export const PairLeaderBoard = ({ 
  leaderboard = {}, 
  isOverall,
  genderFilter = 'male' // Default to male if not specified
}) => {
  // For overall leaderboard, we'll structure data differently
  const isOverallView = isOverall && leaderboard?.data?.rankings;

  // Process overall rankings data if in overall view
  const processedOverallData = isOverallView ? {
    male: leaderboard.data.rankings
      .filter(item => item.male_score > 0)
      .map(item => ({
        id: item.id,
        name: item.male_name,
        total_score: item.male_score.toFixed(2) + '%',
        segments: [
          {
            segment_name: 'Male Contribution',
            weighted_contribution: item.male_score.toFixed(2)
          }
        ]
      })),
    female: leaderboard.data.rankings
      .filter(item => item.female_score > 0)
      .map(item => ({
        id: item.id,
        name: item.female_name,
        total_score: item.female_score.toFixed(2) + '%',
        segments: [
          {
            segment_name: 'Female Contribution',
            weighted_contribution: item.female_score.toFixed(2)
          }
        ]
      }))
  } : null;

  // Determine which data to use
  const displayData = isOverallView ? processedOverallData : leaderboard;
  
  // Ensure we always have arrays to work with
  const filteredLeaderboard = Array.isArray(displayData?.[genderFilter]) 
    ? displayData[genderFilter] 
    : [];

  // ========================
  // Podium Display Component
  // ========================
  const PodiumDisplay = ({ winners }) => {
    if (!winners || winners.length === 0) return null;

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
          {totalScore || '0%'}
        </p>
      </div>
    );

    return (
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-12">
        {winners.slice(0, 3).map((candidate, index) => (
          <motion.div
            key={`${genderFilter}-${candidate.id || index}`}
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
    if (!contestants || contestants.length === 0) return null;

    const JudgeScores = ({ scores }) => (
      <div className="flex-1 px-4 text-sm text-gray-600 dark:text-gray-400">
        {scores?.map((judge) => (
          <p key={judge.judge_id} className="text-center">
            <span>{judge.judge}: </span>
            <span>{judge.judge_total}%</span>
          </p>
        ))}
      </div>
    );
  
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
            <li key={`${genderFilter}-${candidate.id || index}`} className="flex flex-col p-3 border-b last:border-b-0">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center min-w-[200px]">
                  <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">
                    {index + 4}.
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

                {isOverall ? (
                  candidate.segments && <OverallScoreDisplay segments={candidate.segments} />
                ) : (
                  candidate.judge_scores && <JudgeScores scores={candidate.judge_scores} />
                )}

                <div className="min-w-[80px] text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {isOverall
                      ? `${candidate.total_score || '0%'}`
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

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-2">
          {genderFilter === 'male' ? (
            <span className="flex items-center text-blue-600 dark:text-blue-400">
              <FaMale className="mr-2" /> Male Contestants
            </span>
          ) : (
            <span className="flex items-center text-pink-600 dark:text-pink-400">
              <FaFemale className="mr-2" /> Female Contestants
            </span>
          )}
        </h3>
        
        {filteredLeaderboard.length > 0 ? (
          <>
            <PodiumDisplay winners={filteredLeaderboard} />
            <ContestantList contestants={filteredLeaderboard.slice(3)} isOverall={isOverall} />
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-4">
            No {genderFilter} pairs data available
          </p>
        )}
      </section>
    </div>
  );
};