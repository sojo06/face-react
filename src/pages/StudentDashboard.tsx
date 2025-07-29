import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, User } from 'lucide-react';
import { origin } from '@/lib/constants';

type Student = {
  _id: string;
  name: string;
  email: string;
  department: string;
  division: string;
};


type AttendanceRecord = {
  _id: string;
  date: string;
  department: string;
  division: string;
  createdAt: string;
  label:string,
  subject:string
};

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'training' | 'attendance'>('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  setProfileImage(null);
  // const [imageGallery, setImageGallery] = useState<string[]>([]);

  const studentId = localStorage.getItem('uid');
  const token = localStorage.getItem('authToken');

  const api = axios.create({
    baseURL: `${origin}/api/students`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;

      try {
        const [profileRes, attendanceRes] = await Promise.all([
          api.get(`/profile`),
          api.get(`/attendance`)
        ]);

        setStudent(profileRes.data);
        setAttendance(attendanceRes.data);

        // Extract image URLs
       

        // setImageGallery(allImages.slice(0, 4)); // first 4 for gallery
      } catch (err) {
        console.error('Error loading student data:', err);
      }
    };

    fetchData();
  }, [studentId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="p-4">
  <div className="flex flex-col items-center space-y-2 mb-8">
    {profileImage ? (
      <img
        src={profileImage}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover border"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-6 h-6 text-gray-500" />
      </div>
    )}
    <div className="text-center">
      <h3 className="font-semibold">{student?.name || 'Student'}</h3>
      <p className="text-sm text-gray-500">
        {student?.department}-{student?.division}
      </p>
    </div>
  </div>

  <nav className="space-y-2">
    <button
      onClick={() => setActiveTab('profile')}
      className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
        activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
      }`}
    >
      <User className="w-5 h-5" />
      <span>Profile</span>
    </button>
    {/* <button
      onClick={() => setActiveTab('training')}
      className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
        activeTab === 'training' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
      }`}
    >
      <Camera className="w-5 h-5" />
      <span>Training Data</span>
    </button> */}
    <button
      onClick={() => setActiveTab('attendance')}
      className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
        activeTab === 'attendance' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
      }`}
    >
      <History className="w-5 h-5" />
      <span>Attendance</span>
    </button>
  </nav>

  <button
    onClick={() => {
      localStorage.removeItem('token');
      localStorage.removeItem('uid');
      window.location.href = '/login';
    }}
    className="w-full mt-6 bg-red-100 text-red-600 hover:bg-red-200 font-medium py-2 px-4 rounded transition"
  >
    Logout
  </button>
</div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {activeTab === 'profile' && student && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Student Profile</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Department</p>
                  <p className="font-medium">{student.department}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Division</p>
                  <p className="font-medium">{student.division}</p>
                </div>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'attendance' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Attendance History</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">label</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">time</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.label}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.subject}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.division}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
