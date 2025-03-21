import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</p>
          <h3 className="text-3xl font-bold text-black dark:text-white mt-1">{value}</h3>
        </div>
        {icon && <div className="text-black dark:text-gray-100">{icon}</div>}
      </div>
    </div>
  );
};

interface StatsSectionProps {
  totalStudents: number;
  studentsToday: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ 
  totalStudents = 0, 
  studentsToday = 0 
}) => {
  return (
    <div className="bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-6">
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Students Today" 
            value={studentsToday}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard 
            title="Total Students" 
            value={totalStudents}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default StatsSection; 