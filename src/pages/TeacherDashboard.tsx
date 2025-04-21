
import  { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera, Users, Calendar, LogOut } from "lucide-react";
import { origin } from "@/lib/constants";
import dayjs from "dayjs";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
interface Student {
  student: {
    _id: string;
    name: string;
    email: string;
    rollNumber: string;
    department: string;
    division: string;
  };
  totalUploads: number;
  images: string[];
  lastUpload: string;
  status: string;
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<"attendance" | "students" | "training">("attendance");
  const [classSummary, setClassSummary] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [newStudent, setNewStudent] = useState({
    studentid: "",
    files: null as FileList | null,
  });

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (activeTab === "students") {
      fetchSummary();
    }
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${origin}/api/teacher/class-summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log(res.data);
      setClassSummary(res.data.students);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("uid");
    navigate("/login");
  };

  const handleImageUpload = async () => {
    if (!newStudent.studentid || !newStudent.files?.length) {
      return toast.error("Please enter student ID and select images");
    }

    const formData = new FormData();
    for (let i = 0; i < newStudent.files.length; i++) {
      formData.append("files", newStudent.files[i]);
    }
    formData.append("studentId", newStudent.studentid);
    formData.append("uploadedBy", "teacher");

    try {
      await axios.post(`${origin}/api/teacher/upload-images`, formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Images uploaded successfully");
      setNewStudent({ studentid: "", files: null });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
  };

  const handleTrainClick = async () => {
    try {
      const res = await axios.post(`${origin}/api/teacher/train-all`, {
        // department: "CSE",
        // division: "A",
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Training failed");
    }
  };

  const captureAndSend = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return toast.error("Failed to capture image");

      const blob = await fetch(imageSrc).then(res => res.blob());
      const formData = new FormData();
      formData.append("image", blob, "webcam.jpg");
      // formData.append("department", "CSE");
      // formData.append("division", "A");

      try {
        const res = await axios.post(`${origin}/api/teacher/mark-attendance`, formData, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        toast.success("Attendance marked successfully");
        console.log(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Attendance marking failed");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">Teacher</h3>
              <p className="text-sm text-gray-500">CSE Department</p>
            </div>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                activeTab === "attendance" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Take Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                activeTab === "students" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Manage Students</span>
            </button>
            {/* <button
              onClick={() => setActiveTab("training")}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                activeTab === "training" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Training Data</span>
            </button> */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full p-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8 overflow-auto">
        {activeTab === "attendance" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Take Attendance</h2>
              <button
                onClick={captureAndSend}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capture & Mark</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-4">Live Camera Feed</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center space-y-4">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg w-full h-auto"
                    videoConstraints={{ facingMode: "user" }}
                  />
                </div>
              </div>
              {/* <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-4">Detected Students</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"
                        alt="Student"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-500">CSE-A • Roll: 101</p>
                      </div>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Confidence: 98%</span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Students</h2>
              <input
                type="text"
                value={newStudent.studentid}
                onChange={(e) => setNewStudent({ ...newStudent, studentid: e.target.value })}
                placeholder="Student ID"
                className="border p-2 rounded mr-2"
              />
              <input
                type="file"
                multiple
                onChange={(e) => setNewStudent({ ...newStudent, files: e.target.files })}
                className="mr-2"
              />
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={handleImageUpload}
              >
                Upload Images
              </button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Total Uploads</th>
                      <th className="px-4 py-3 text-left">Last Upload</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Images</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-black">
                    {classSummary.map((student) => (
                      <tr key={student.student._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-black">
                          {student.student.name}
                        </td>
                        <td className="px-6 py-4">{student.student.email}</td>
                        <td className="px-6 py-4">{student.totalUploads}</td>
                        <td className="px-4 py-3">
                          {student.lastUpload
                            ? dayjs(student.lastUpload).format("DD MMM YYYY, HH:mm")
                            : "No uploads yet"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              student.status === "Processed"
                                ? "bg-green-700 text-white"
                                : "bg-yellow-600 text-white"
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {student.images?.slice(0, 3).map((img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img}
                                alt="upload"
                                className="w-10 h-10 object-cover rounded border border-gray-600"
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-2xl font-bold">Training Data</h2>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={handleTrainClick}
              >
                Train All Students
              </button>
            </div>
          </div>
        )}

        {activeTab === "training" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Training Data</h2>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={handleTrainClick}
              >
                Train All Students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
