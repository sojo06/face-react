import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera, Users, Calendar, LogOut, Clock } from "lucide-react";
import { origin } from "@/lib/constants";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/ui/file-upload";
import Webcam from "react-webcam"; // ✅ NEW
import  { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
interface AttendanceRecord {
  name: string;
  uid: string;
  email: string;
  time: string;
}

export default function TeacherDashboard() {
  const webcamRef = useRef<Webcam>(null);
  const [activeTab, setActiveTab] = useState<
    "attendance" | "students" | "training" | "history"
  >("attendance");
  const [classSummary, setClassSummary] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [historyQuery, setHistoryQuery] = useState({
    date: "",
    fromTime: "",
    toTime: "",
  });
  const [newStudent, setNewStudent] = useState<{
    studentid: string;
    files: File[];
  }>({
    studentid: "",
    files: [],
  });

  const [department, setDepartment] = useState("");
  const [division, setDivision] = useState("");

  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);

  // useEffect(() => {
  //   if (activeTab === "students") {
  //     fetchSummary();
  //   }
  // }, [activeTab]);
  const handleCaptureAndUpload = async () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return toast.error("Failed to capture image");

    const blob = await (await fetch(screenshot)).blob();
    const formData = new FormData();
    formData.append("image", blob, "webcam.jpg");

    try {
      setUploadingAttendance(true);
      const res = await axios.post(
        `${origin}/api/teacher/mark-attendance`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Attendance marked successfully via webcam");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Webcam attendance failed");
    } finally {
      setUploadingAttendance(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${origin}/api/teacher/class-summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        params: {
          department: department,
          division: division,
        },
      });
      setClassSummary(res.data.students);
      if (res.data.students.length === 0) {
        toast.error("No students found for the given department and division.");
      } else {
        toast.success("Class summary fetched successfully");
      }
      setLoading(false);
      console.log(loading);
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast.error("Failed to fetch class summary");
      setLoading(true);
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
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Images uploaded successfully");
      setNewStudent({ studentid: "", files: [] });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
  };

  const handleTrainClick = async () => {
    try {
      const res = await axios.post(
        `${origin}/api/teacher/train-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Training failed");
    }
  };

  const handleAttendanceFileUpload = async () => {
    if (!attendanceFile) {
      return toast.error("Please select an image to mark attendance.");
    }

    const formData = new FormData();
    formData.append("image", attendanceFile);
    // formData.append("department", "CSE");
    // formData.append("division", "A");

    try {
      setUploadingAttendance(true);
      const res = await axios.post(
        `${origin}/api/teacher/mark-attendance`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Attendance marked successfully");
      console.log(res.data);
      setAttendanceFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Attendance marking failed");
    } finally {
      setUploadingAttendance(false);
    }
  };
  const downloadCSV = () => {
    if (attendanceHistory.length === 0)
      return toast.error("No data to download");

    const header = "Name,Roll Number,Email,Time\n";
    const rows = attendanceHistory
      .map((s) => `${s.name},${s.uid},${s.email},${s.time}`)
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const fetchAttendanceHistory = async () => {
    const { date, fromTime, toTime } = historyQuery;
    if (!date || !fromTime || !toTime)
      return toast.error("Please fill all fields");

    try {
      const res = await axios.get(`${origin}/api/teacher/attendance-history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        params: { date, fromTime, toTime },
      });
      setAttendanceHistory(res.data.records);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch history");
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
                activeTab === "attendance"
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Take Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                activeTab === "students"
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Manage Students</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg ${
                activeTab === "history"
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Attendance History</span>
            </button>
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
          
          // <div>
          //   <div className=" justify-between items-center mb-6">
          //     <h2 className="text-2xl font-bold">Take Attendance</h2>
          //     <div className=" gap-2 items-center">
          //       <FileUpload

          //         onChange={(files) => setAttendanceFile(files?.[0] || null)}
          //       />
          //       <button
          //         onClick={handleAttendanceFileUpload}
          //         className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 hover:bg-indigo-900"
          //         disabled={uploadingAttendance}
          //       >
          //         <Camera className="w-5 h-5" />
          //         <span>{uploadingAttendance ? "Uploading..." : "Upload & Mark"}</span>
          //       </button>
          //     </div>
          //   </div>
          // </div>
          <div>
      
          
          <div className="flex flex-col md:flex-row justify-around gap-4 ">
   
            <div className="flex flex-col items-center">
              <FileUpload
                onChange={(files) => setAttendanceFile(files?.[0] || null)}
              />
              <button
                onClick={handleAttendanceFileUpload}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 hover:bg-indigo-900 mt-2"
                disabled={uploadingAttendance}
              >
                <Camera className="w-5 h-5" />
                <span>
                  {uploadingAttendance ? "Uploading..." : "Upload & Mark"}
                </span>
              </button>
            </div>

            <div className="flex flex-col items-center">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-md border border-gray-300"
                width={500}
                height={500}
              />
              <button
                onClick={handleCaptureAndUpload}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-800 disabled:opacity-50"
                disabled={uploadingAttendance}
              >
                <Camera className="w-5 h-5" />
                <span>
                  {uploadingAttendance ? "Uploading..." : "Capture & Mark"}
                </span>
              </button>
            </div>
          </div>
          <Card className="mt-6">
  <CardHeader>
    <h2 className="text-xl font-semibold">Attendance Instructions</h2>
  </CardHeader>
  <CardContent>
    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
      <li>Select the date and time range before uploading an image.</li>
      <li>Ensure the uploaded classroom image is clear and well-lit.</li>
      <li>Image must show full student faces for accurate recognition.</li>
      <li>Click "Upload & Mark" to process and record attendance.</li>
      <li>Wait for confirmation before uploading another image.</li>
      <li>Use the "Export CSV" button to download attendance history.</li>
      <li>If students are not recognized, ensure their training data is added.</li>
      <li>Always refresh the page after uploading or marking attendance.</li>
    </ul>
  </CardContent>
</Card>
          </div>
        )}

{activeTab === "students" && (
  <div className="space-y-8">
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Students</h2>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Division</label>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Division"
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            onClick={fetchSummary}
          >
            Fetch Students
          </button>
        </div>
      </Card>
    </div>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">UID</th>
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
                <td className="px-4 py-3">{student.student.name}</td>
                <td className="px-4 py-3">{student.student._id}</td>
                <td className="px-4 py-3">{student.student.email}</td>
                <td className="px-4 py-3">{student.totalUploads}</td>
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
                    {student.images?.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="upload"
                        className="w-10 h-10 object-cover rounded border border-gray-300"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    )}

    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Student</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={newStudent.studentid}
          onChange={(e) =>
            setNewStudent({ ...newStudent, studentid: e.target.value })
          }
          placeholder="Student ID"
          className="border p-2 rounded"
        />
        <FileUpload
          onChange={(files) =>
            setNewStudent({ ...newStudent, files: files || [] })
          }
        />
      </div>
      <button
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        onClick={handleImageUpload}
      >
        Upload Images
      </button>
    </Card>

    <div className="flex justify-between items-center mt-6">
      <h2 className="text-2xl font-bold">Training</h2>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        onClick={handleTrainClick}
      >
        Train All Students
      </button>
    </div>

    <Card className="mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Training Data Instructions</h2>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Search for a student using their email ID.</li>
          <li>If the student doesn't exist, a new record will be created automatically.</li>
          <li>Upload 5–10 clear images showing the student's face from different angles.</li>
          <li>Ensure good lighting and no occlusions (e.g., masks, hands).</li>
          <li>After uploading images, click "Train Model" to update face recognition data.</li>
          <li>Training can take a few minutes — wait for confirmation.</li>
          <li>Re-train after uploading images for new or existing students.</li>
          <li>Check the "Class Summary" tab to see which students have training data.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
)}


        {activeTab === "history" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Attendance History</h2>
            <div className="flex gap-4 mb-4 items-end">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={historyQuery.date}
                  onChange={(e) =>
                    setHistoryQuery({ ...historyQuery, date: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">From Time</label>
                <input
                  type="time"
                  value={historyQuery.fromTime}
                  onChange={(e) =>
                    setHistoryQuery({
                      ...historyQuery,
                      fromTime: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">To Time</label>
                <input
                  type="time"
                  value={historyQuery.toTime}
                  onChange={(e) =>
                    setHistoryQuery({ ...historyQuery, toTime: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <button
                onClick={fetchAttendanceHistory}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Fetch
              </button>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Export CSV
              </button>
            </div>
            {attendanceHistory.length > 0 ? (
              <div className="bg-white p-4 rounded shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Time</th>

                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">uid</th>
                      <th className="px-4 py-3 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.map((rec, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">{rec.name}</td>
                        <td className="px-4 py-3">{rec.email}</td>
                        <td className="px-4 py-3">{rec.uid}</td>
                        <td className="px-4 py-3">{rec.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No records found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
