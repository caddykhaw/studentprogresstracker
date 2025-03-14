import React, { useState, useEffect } from 'react';
import StatsSection from '../components/StatsSection';
import ThemeToggle from '../components/ThemeToggle';

// Mock student data - replace with actual data fetching
interface Student {
  id: string;
  name: string;
  grade: string;
  attendance: string;
  lastActive: string;
}

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simulate fetching students data
  useEffect(() => {
    // Mock API call
    const fetchStudents = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/students');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData: Student[] = [
          { id: '1', name: 'Jane Smith', grade: 'A', attendance: '95%', lastActive: 'Today' },
          { id: '2', name: 'John Doe', grade: 'B+', attendance: '87%', lastActive: 'Yesterday' },
          { id: '3', name: 'Sarah Johnson', grade: 'A-', attendance: '92%', lastActive: 'Today' },
          { id: '4', name: 'Michael Brown', grade: 'C', attendance: '78%', lastActive: '3 days ago' },
          { id: '5', name: 'Emma Wilson', grade: 'A+', attendance: '98%', lastActive: 'Today' },
        ];
        
        setStudents(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Calculate today's active students count
  const studentsToday = students.filter(student => student.lastActive === 'Today').length;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main>
        {/* Stats Section - positioned above the student list */}
        <StatsSection totalStudents={students.length} studentsToday={studentsToday} />
        
        {/* Student List Section */}
        <section className="container mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student List</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Loading students...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Attendance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.attendance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 