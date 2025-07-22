import { motion } from 'framer-motion';
import { FaFemale, FaMale } from "react-icons/fa";

export const PairLeaderBoard = ({ 
  leaderboard, 
  isOverall,
  segmentName,
  genderFilter // 'male' or 'female'
}) => {
  // Extract leaderboards based on selected gender
  const filteredLeaderboard = genderFilter === 'male' 
    ? leaderboard?.male || [] 
    : leaderboard?.female || [];

  // Podium display component for pairs
  const PodiumDisplay = ({ winners, gender }) => (
    <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-12">
      {winners.slice(0, 3).map((candidate, index) => (
        <motion.div
          key={`${gender}-${candidate.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
          style={{ minWidth: index === 0 ? "120px" : "100px" }}
        >
          <div className="relative">
            <img
              src={`/storage/${candidate.picture}`}
              alt={candidate.name}
              className="w-30 h-35 rounded-full object-cover border-4 border-white"
            />
            <span className="badgeBounce absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg px-8 py-3 rounded-full">
              {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
            </span>
          </div>
          <h4 className="text-gray-900 dark:text-white text-lg font-bold mt-2">
            {candidate.name}
          </h4>
          {!isOverall && candidate.judge_scores && (
            <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 mx-4">
              {candidate.judge_scores.map((judge) => (
                <p key={judge.judge_id} className="text-center">
                  <span>{judge.judge}: </span>
                  <span>{judge.judge_total}%</span>
                </p>
              ))}
            </div>
          )}
          <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
            {isOverall 
              ? `Total: ${parseFloat(candidate.total_score?.replace('%', '') || 0).toFixed(2)}%`
              : `Score: ${candidate.judge_score}%`}
          </p>
         
        </motion.div>
      ))}
    </div>
  );

  // Contestant list component for pairs
  const ContestantList = ({ contestants, gender }) => (
    <div className="mt-6">
  
      <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {contestants.slice(3).map((candidate, index) => (
          <li key={`${gender}-${candidate.id}`} className="flex flex-col p-3 border-b last:border-b-0">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center min-w-[200px]">
                <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">
                  {index + 4}.
                </span>
                <img 
                  src={`/storage/${candidate.picture}`} 
                  alt={candidate.name} 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mr-3" 
                />
                <span className="text-gray-900 dark:text-white font-semibold">
                  {candidate.name}
                </span>
              </div>

              {!isOverall && candidate.judge_scores && (
                <div className="flex-1 px-4 text-center">
                  {candidate.judge_scores.map((judge) => (
                    <p key={judge.judge_id} className="text-sm text-gray-600 dark:text-gray-400">
                      <span>{judge.judge}: </span>
                      <span>{judge.judge_total}%</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="min-w-[80px] text-right">
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {isOverall
                    ? `${parseFloat(candidate.total_score || 0).toFixed(2)}%`
                    : `${candidate.judge_score}%`}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-8">
     

      <section>
        <h3 className="text-lg font-semibold mb-2">
          {genderFilter === 'male' ? (

            
            <span className="text-blue-600 dark:text-blue-400">Male Contestants</span>
          ) : (
            <span className="text-pink-600 dark:text-pink-400">Female Contestants</span>
          )}
        </h3>
        {filteredLeaderboard.length > 0 ? (
          <>
            <PodiumDisplay 
              winners={filteredLeaderboard} 
              gender={genderFilter} 
            />
            <ContestantList 
              contestants={filteredLeaderboard} 
              gender={genderFilter} 
            />
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