import { motion } from 'framer-motion';
import { FaFemale, FaMale } from "react-icons/fa";
import { useEffect, useState } from 'react';
import axios from 'axios';

export const PairLeaderBoard = ({ 
  isOverall = false,
  genderFilter = 'male',
  segmentId = null 
}) => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let url = isOverall 
          ? `/PairLeaderboard/PairOverAll/${genderFilter}`
          : `/PairLeaderboard/segment/${segmentId}/${genderFilter}`;
        
        const response = await axios.get(url);
        setLeaderboard(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOverall, genderFilter, segmentId]);

  const processedData = leaderboard?.leaderboard?.map(item => ({
    id: item.id,
    name: item.name,
    picture: item.picture,
    pair_name: item.pair_name,
    total_score: item.total_score,
    rank: item.rank,
    judge_scores: item.judge_scores,
    segments: item.segments,
    judge_score: item.judge_score,
    judge_total: item.judge_total
  })) || [];

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
  className={`relative flex flex-col items-center p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 ${
    index === 0 ? 'md:order-2 h-72' :  // Increased height to accommodate
    index === 1 ? 'md:order-1 h-60' : 
    'md:order-3 h-56'
  }`}
  style={{ minWidth: index === 0 ? "120px" : "100px" }}
>
  {/* Pair name with extra top margin */}
  {candidate.pair_name && (
    <p className="text-lg font-bold text-gray-900 dark:text-white mb-1 mt-4">
      {candidate.pair_name}
    </p>
  )}
  
  {/* Image container with adjusted positioning */}
  <div className="relative mt-2">  {/* Added margin-top */}
    {candidate.picture && (
      <img
        src={`/storage/${candidate.picture}`}
        alt={candidate.name || 'Candidate'}
        className={`rounded-full object-cover border-4 ${
          index === 0 ? 'w-32 h-32 border-yellow-400' :
          index === 1 ? 'w-28 h-28 border-gray-300' :
          'w-24 h-24 border-amber-600'
        }`}
      />
    )}
    {/* Medal badge - positioned absolutely within the image container */}
    <span className="badgeBounce absolute -top-0 left-1/2 transform -translate-x-1/2 text-white text-lg px-8 py-3 rounded-full">
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

  const ContestantList = ({ contestants = [] }) => {
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
            <motion.li 
              key={`${genderFilter}-${candidate.id || index}`} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
              className="flex flex-col p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
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
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {candidate.name || 'Unknown Candidate'}
                    </p>
                    {candidate.pair_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {candidate.pair_name}
                      </p>
                    )}
                  </div>
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
                  {candidate.rank && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Rank #{candidate.rank}
                    </p>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-500 mb-2">Error loading leaderboard</div>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
      
        
        {processedData.length > 0 ? (
          <>
            <PodiumDisplay winners={processedData} />
            <ContestantList contestants={processedData.slice(3)} />
          </>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              No {genderFilter} contestants found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {isOverall ? 'Overall rankings' : 'Segment results'} will appear here
            </p>
          </div>
        )}
      </section>
    </div>
  );
};