import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LearningPlanProps {
  plan: {
    id: number;
    name: string;
    createdAt: string;
    progress: number;
    topicsCount: number;
  };
}

const LearningPlanCard: React.FC<LearningPlanProps> = ({ plan }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/learning-plan/${plan.id}`);
  };
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-96 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">
        <h2 className="text-blue-600 font-bold text-2xl mb-2 line-clamp-2">{plan.name}</h2>
        <p className="text-gray-600 text-sm flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {plan.topicsCount} {plan.topicsCount === 1 ? 'Topic' : 'Topics'}
        </p>
      </div>
      
      <p className="text-gray-500 text-sm mb-4 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatDate(plan.createdAt)}
      </p>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-green-700">{plan.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              plan.progress < 30 ? 'bg-green-400' : 
              plan.progress < 70 ? 'bg-green-500' : 'bg-green-600'
            }`}
            style={{ width: `${plan.progress}%` }}
          ></div>
        </div>
      </div>

      <button
  onClick={handleViewDetails}
  className="mt-6 w-full bg-white text-blue-600 border-2 border-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-colors duration-200 flex items-center justify-center text-lg"
>
  <span>View Details</span>
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
</button>
    </div>
  );
};

export default LearningPlanCard;