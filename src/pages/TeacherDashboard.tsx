import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera, Users, Calendar, LogOut, Clock } from "lucide-react";
import { origin } from "@/lib/constants";
// import dayjs from "dayjs";
import { toast } from "react-hot-toast";
// import { FileUpload } from "@/components/ui/file-upload";
import Webcam from "react-webcam"; // ✅ NEW
import { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
interface UploadedModel {
  modelName: string;
  department: string;
  division: string;
  filePath: string;
  createdAt: string;
}
// interface Student {
//   student: {
//     _id: string;
//     name: string;
//     email: string;
//     rollNumber: string;
//     department: string;
//     division: string;
//   };
//   totalUploads: number;
//   images: string[];
//   lastUpload: string;
//   status: string;
// }
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
  // const [classSummary, setClassSummary] = useState<Student[]>([]);
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [historyQuery, setHistoryQuery] = useState({
    date: "",
    fromTime: "",
    toTime: "",
  });
  const [department, setDepartment] = useState("");
  const [division, setDivision] = useState("");
  const [subject, setSubject] = useState("");

  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [showModelList, setShowModelList] = useState(false);

  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploadDepartment, setUploadDepartment] = useState("");
  const [uploadDivision, setUploadDivision] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // const [newStudent, setNewStudent] = useState<{
  //   studentid: string;
  //   files: File[];
  // }>({
  //   studentid: "",
  //   files: [],
  // });

  // const [department, setDepartment] = useState("");
  // const [division, setDivision] = useState("")
  const [attendanceFile, setAttendanceFile] = useState<File[]>([]);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);

  // useEffect(() => {
  //   if (activeTab === "students") {
  //     fetchSummary();
  //   }
  // }, [activeTab]);
  const fetchUploadedModels = async () => {
    try {
      console.log("wkdwjdj");
      const response = await axios.get(
        `${origin}/api/teacher/uploaded-models`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      ); // adjust base URL if needed
      console.log(response.data);
      setUploadedModels(response.data);
      setShowModelList(true);
    } catch (error) {
      console.error("Error fetching model list:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttendanceFile(Array.from(files)); // Convert FileList to Array
    }
  };

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

  const handleModelUpload = async () => {
    if (!modelFile || !uploadDepartment || !uploadDivision) {
      toast.error("Please select a file and enter department & division.");
      return;
    }

    const formData = new FormData();
    formData.append("model", modelFile);
    formData.append("department", uploadDepartment);
    formData.append("division", uploadDivision);

    try {
      setIsUploading(true);

      const res = await axios.post(
        `${origin}/api/teacher/upload-model`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res);
      setIsUploading(false);

      if (res.status === 200) {
        toast.success("Model uploaded successfully!");
        // setModelFile(null);
        // setUploadDepartment("");
        // setUploadDivision("");
        setIsUploading(false);
      } else {
        toast.error("Model upload failed.");
        setIsUploading(false);
      }
    } catch (error: any) {
      setIsUploading(false);

      console.error("Error uploading model:", error);
      toast.error(error?.response?.data?.error || "Error uploading model.");
    } finally {
      setIsUploading(false);
    }
  };

  // const fetchSummary = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(`${origin}/api/teacher/class-summary`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //       },
  //       params: {
  //         department: department,
  //         division: division,
  //       },
  //     });
  //     setClassSummary(res.data.students);
  //     if (res.data.students.length === 0) {
  //       toast.error("No students found for the given department and division.");
  //     } else {
  //       toast.success("Class summary fetched successfully");
  //     }
  //     setLoading(false);
  //     console.log(loading);
  //   } catch (error) {
  //     console.error("Error fetching summary:", error);
  //     toast.error("Failed to fetch class summary");
  //     setLoading(true);
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("uid");
    navigate("/login");
  };

  // const handleImageUpload = async () => {
  //   if (!newStudent.studentid || !newStudent.files?.length) {
  //     return toast.error("Please enter student ID and select images");
  //   }

  //   const formData = new FormData();
  //   for (let i = 0; i < newStudent.files.length; i++) {
  //     formData.append("files", newStudent.files[i]);
  //   }
  //   formData.append("studentId", newStudent.studentid);
  //   formData.append("uploadedBy", "teacher");

  //   try {
  //     await axios.post(`${origin}/api/teacher/upload-images`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     toast.success("Images uploaded successfully");
  //     setNewStudent({ studentid: "", files: [] });
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Image upload failed");
  //   }
  // };

  // const handleTrainClick = async () => {
  //   try {
  //     const res = await axios.post(
  //       `${origin}/api/teacher/train-all`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //         },
  //       }
  //     );

  //     toast.success(res.data.message);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Training failed");
  //   }
  // };

  const handleAttendanceFileUpload = async () => {
    if (!attendanceFile||!subject||!department||!division) {
      return toast.error("Please select an image to mark attendance.");
    }

    const formData = new FormData();
    attendanceFile.forEach((file) => {
      formData.append("images", file);
      
    });
    formData.append("subject",subject);
      formData.append("division",division);
      formData.append("department",department);

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
      setAttendanceFile([]);
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
          <div>
            <div className="flex flex-col md:flex-row justify-around gap-4 ">
              <div className="flex flex-col items-center">
                {/* <FileUpload
                onChange={(files) => setAttendanceFile(files || null)}
              /> */}
                <label className="text-md font-medium mb-2 text-gray-700">
                  Upload student face images
                </label>
                <div className="mb-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="mb-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division
                  </label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. A"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="mb-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. DBMS"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />

                {attendanceFile.length > 0 ? (
                  <div className="mt-3 w-full px-2 text-sm text-gray-600">
                    <p className="font-medium">Selected files:</p>
                    <ul className="list-disc list-inside">
                      {attendanceFile.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    No files selected yet.
                  </p>
                )}

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
                <h2 className="text-xl font-semibold">
                  Attendance Instructions
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Select the date and time range before uploading an image.
                  </li>
                  <li>
                    Ensure the uploaded classroom image is clear and well-lit.
                  </li>
                  <li>
                    Image must show full student faces for accurate recognition.
                  </li>
                  <li>
                    Click "Upload & Mark" to process and record attendance.
                  </li>
                  <li>Wait for confirmation before uploading another image.</li>
                  <li>
                    Use the "Export CSV" button to download attendance history.
                  </li>
                  <li>
                    If students are not recognized, ensure their training data
                    is added.
                  </li>
                  <li>
                    Always refresh the page after uploading or marking
                    attendance.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "students" && (
          <div className="space-y-8 mt-8">
            {/* Upload Card */}
            <Card className="p-8 bg-white border border-gray-200 shadow-md rounded-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                📤 Upload Trained Model
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                    placeholder="e.g., CS"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Division
                  </label>
                  <input
                    type="text"
                    value={uploadDivision}
                    onChange={(e) => setUploadDivision(e.target.value)}
                    placeholder="e.g., A"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload `.pkl` Model File
                </label>
                <input
                  type="file"
                  accept=".pkl"
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0 file:text-sm file:font-medium
                     file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setModelFile(file);
                  }}
                />
                {modelFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    📄 {modelFile.name}
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <div className="mt-6 text-right">
                <button
                  onClick={handleModelUpload}
                  disabled={
                    !modelFile ||
                    !uploadDepartment ||
                    !uploadDivision ||
                    isUploading
                  }
                  className={`px-6 py-2 rounded-md font-semibold text-white transition duration-200 ${
                    isUploading ||
                    !modelFile ||
                    !uploadDepartment ||
                    !uploadDivision
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Upload Model"}
                </button>
                {/* Fetch Uploaded Models */}
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={fetchUploadedModels}
                  className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                >
                  📄 Show Uploaded Models
                </button>
              </div>
            </Card>
            {showModelList && uploadedModels.length > 0 && (
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  📋 Uploaded Models
                </h2>
                <ul className="divide-y divide-gray-200 border rounded-md">
                  {uploadedModels.map((model, index) => (
                    <li key={index} className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {model.modelName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Dept: {model.department} | Div: {model.division}
                      </div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(model.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instruction Card */}
            <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">
                  📘 Model Upload Instructions
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li>
                    Train your face recognition model externally (e.g., using
                    Python + sklearn).
                  </li>
                  <li>
                    Ensure the model is saved as a `.pkl` file and supports
                    inference properly.
                  </li>
                  <li>Fill in Department and Division (e.g., CS, A).</li>
                  <li>
                    Click the "Upload Model" button to upload the trained `.pkl`
                    file to the server.
                  </li>
                  <li>
                    This model will be used to recognize faces in the uploaded
                    student images.
                  </li>
                  <li>
                    You can replace/update the model anytime by uploading a new
                    `.pkl` file.
                  </li>
                  <li>
                    Ensure model compatibility with your backend inference
                    logic.
                  </li>
                  <li>
                    Once uploaded, test recognition via the "Mark Attendance"
                    tab.
                  </li>
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

                      {/* <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">uid</th>
                      <th className="px-4 py-3 text-left">Time</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.map((rec, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">{rec.name}</td>
                        {/* <td className="px-4 py-3">{rec.email}</td>
                        <td className="px-4 py-3">{rec.uid}</td> */}
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
