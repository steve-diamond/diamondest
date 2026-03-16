import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search,
  School,
  UserCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'student';
}

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  teacher_id: number;
  teacher_name?: string;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  student_name: string;
  course_name: string;
  enrollment_date: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: null as number | null, name: '', email: '', grade: '' });
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ id: null as number | null, name: '', email: '', subject: '' });
  
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: null as number | null, name: '', description: '', teacher_id: '' });
  
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: null as number | null, course_name: '' });
  
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  
  const [formError, setFormError] = useState('');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Fetch data
  const fetchData = async () => {
    try {
      const [sRes, tRes, cRes, eRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/teachers'),
        fetch('/api/courses'),
        fetch('/api/enrollments')
      ]);
      setStudents(await sRes.json());
      setTeachers(await tRes.json());
      setCourses(await cRes.json());
      setEnrollments(await eRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
    } else {
      setError(data.message);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Frontend Validation
    if (studentForm.name.trim().length < 2) {
      setFormError('Name must be at least 2 characters long');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(studentForm.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (!studentForm.grade) {
      setFormError('Please select a grade');
      return;
    }

    const isEditing = !!studentForm.id;
    const url = isEditing ? `/api/students/${studentForm.id}` : '/api/students';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentForm.name,
          email: studentForm.email,
          grade: studentForm.grade
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsStudentModalOpen(false);
        setStudentForm({ id: null, name: '', email: '', grade: '' });
        fetchData();
      } else {
        setFormError(data.error || 'Failed to save student');
      }
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openEditStudent = (student: Student) => {
    setStudentForm({
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade
    });
    setIsStudentModalOpen(true);
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (teacherForm.name.trim().length < 2) {
      setFormError('Name must be at least 2 characters long');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(teacherForm.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (!teacherForm.subject.trim()) {
      setFormError('Please enter a subject');
      return;
    }

    const isEditing = !!teacherForm.id;
    const url = isEditing ? `/api/teachers/${teacherForm.id}` : '/api/teachers';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teacherForm.name,
          email: teacherForm.email,
          subject: teacherForm.subject
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsTeacherModalOpen(false);
        setTeacherForm({ id: null, name: '', email: '', subject: '' });
        fetchData();
      } else {
        setFormError(data.error || 'Failed to save teacher');
      }
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openEditTeacher = (teacher: Teacher) => {
    setTeacherForm({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject
    });
    setIsTeacherModalOpen(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (courseForm.name.trim().length < 2) {
      setFormError('Course name must be at least 2 characters long');
      return;
    }

    if (!courseForm.teacher_id) {
      setFormError('Please assign a teacher');
      return;
    }

    const isEditing = !!courseForm.id;
    const url = isEditing ? `/api/courses/${courseForm.id}` : '/api/courses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: courseForm.name,
          description: courseForm.description,
          teacher_id: parseInt(courseForm.teacher_id)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsCourseModalOpen(false);
        setCourseForm({ id: null, name: '', description: '', teacher_id: '' });
        fetchData();
      } else {
        setFormError(data.error || 'Failed to save course');
      }
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openEditCourse = (course: Course) => {
    setCourseForm({
      id: course.id,
      name: course.name,
      description: course.description,
      teacher_id: course.teacher_id.toString()
    });
    setIsCourseModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!enrollForm.student_id) {
      setFormError('Please select a student');
      return;
    }

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: parseInt(enrollForm.student_id),
          course_id: enrollForm.course_id,
          enrollment_date: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsEnrollModalOpen(false);
        setEnrollForm({ student_id: '', course_id: null, course_name: '' });
        fetchData();
      } else {
        setFormError(data.error || 'Failed to enroll student');
      }
    } catch (err) {
      setFormError('Network error');
    }
  };

  const openEnrollModal = (course: Course) => {
    setEnrollForm({
      student_id: '',
      course_id: course.id,
      course_name: course.name
    });
    setIsEnrollModalOpen(true);
  };

  const handleViewStudents = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-students');
  };

  const handleViewStudentDetails = (studentId: number) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-details');
  };

  const openAddModal = () => {
    if (activeTab === 'students') {
      setStudentForm({ id: null, name: '', email: '', grade: '' });
      setIsStudentModalOpen(true);
    } else if (activeTab === 'teachers') {
      setTeacherForm({ id: null, name: '', email: '', subject: '' });
      setIsTeacherModalOpen(true);
    } else if (activeTab === 'courses') {
      setCourseForm({ id: null, name: '', description: '', teacher_id: '' });
      setIsCourseModalOpen(true);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-card p-8 bg-white"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <School className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">EduManage SMS</h1>
            <p className="text-slate-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="admin123"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            Demo Credentials: admin / admin123
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <School className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">EduManage</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full nav-item ${activeTab === 'students' ? 'active' : ''}`}
          >
            <Users size={20} /> Students
          </button>
          <button 
            onClick={() => setActiveTab('teachers')}
            className={`w-full nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
          >
            <GraduationCap size={20} /> Teachers
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full nav-item ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <BookOpen size={20} /> Courses
          </button>
          <button 
            onClick={() => setActiveTab('enrollments')}
            className={`w-full nav-item ${activeTab === 'enrollments' ? 'active' : ''}`}
          >
            <ClipboardList size={20} /> Enrollments
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-slate-500">Manage your school's {activeTab} information</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
            </div>
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} /> Add New
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="text-blue-600" />} label="Total Students" value={students.length} color="bg-blue-50" />
                <StatCard icon={<GraduationCap className="text-purple-600" />} label="Total Teachers" value={teachers.length} color="bg-purple-50" />
                <StatCard icon={<BookOpen className="text-emerald-600" />} label="Total Courses" value={courses.length} color="bg-emerald-50" />
                <StatCard icon={<UserCheck className="text-orange-600" />} label="Enrollments" value={enrollments.length} color="bg-orange-50" />
                
                <div className="md:col-span-2 lg:col-span-3 glass-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-600" /> Recent Enrollments
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-bottom border-slate-100">
                          <th className="pb-3">Student</th>
                          <th className="pb-3">Course</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {enrollments.slice(0, 5).map(e => (
                          <tr key={e.id} className="text-sm">
                            <td className="py-4 font-medium text-slate-900">{e.student_name}</td>
                            <td className="py-4 text-slate-600">{e.course_name}</td>
                            <td className="py-4 text-slate-500">{e.enrollment_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsStudentModalOpen(true)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium flex items-center justify-between group"
                    >
                      Add Student <Plus size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    </button>
                    <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium flex items-center justify-between group">
                      Create Course <Plus size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    </button>
                    <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium flex items-center justify-between group">
                      Assign Teacher <Plus size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <DataTable 
                headers={['Name', 'Email', 'Grade']}
                data={students.map(s => [s.name, s.email, s.grade])}
                onEdit={(index) => openEditStudent(students[index])}
                onDelete={(index) => handleDeleteStudent(students[index].id)}
                onViewDetails={(index) => handleViewStudentDetails(students[index].id)}
              />
            )}

            {activeTab === 'student-details' && selectedStudentId && (
              <StudentDetails 
                student={students.find(s => s.id === selectedStudentId)!}
                enrollments={enrollments.filter(e => e.student_id === selectedStudentId)}
                onBack={() => setActiveTab('students')}
              />
            )}

            {activeTab === 'teachers' && (
              <DataTable 
                headers={['Name', 'Email', 'Subject']}
                data={teachers.map(t => [t.name, t.email, t.subject])}
                onEdit={(index) => openEditTeacher(teachers[index])}
                onDelete={(index) => handleDeleteTeacher(teachers[index].id)}
              />
            )}

            {activeTab === 'courses' && (
              <DataTable 
                headers={['Course Name', 'Teacher', 'Description']}
                data={courses.map(c => [c.name, c.teacher_name || 'N/A', c.description])}
                onEdit={(index) => openEditCourse(courses[index])}
                onDelete={(index) => handleDeleteCourse(courses[index].id)}
                onEnroll={(index) => openEnrollModal(courses[index])}
                onViewStudents={(index) => handleViewStudents(courses[index].id)}
              />
            )}

            {activeTab === 'course-students' && selectedCourseId && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    Students Enrolled in {courses.find(c => c.id === selectedCourseId)?.name}
                  </h3>
                  <button 
                    onClick={() => setActiveTab('courses')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
                  >
                    ← Back to Courses
                  </button>
                </div>
                <DataTable 
                  headers={['Student ID', 'Student Name']}
                  data={enrollments
                    .filter(e => e.course_id === selectedCourseId)
                    .map(e => [e.student_id, e.student_name])
                  }
                />
              </div>
            )}

            {activeTab === 'enrollments' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="Search by student or course name..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                  />
                </div>
                <DataTable 
                  headers={['Student', 'Course', 'Date']}
                  data={enrollments
                    .filter(e => 
                      e.student_name.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
                      e.course_name.toLowerCase().includes(enrollmentSearch.toLowerCase())
                    )
                    .map(e => [e.student_name, e.course_name, e.enrollment_date])
                  }
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enroll Student</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Course: <span className="text-indigo-600">{enrollForm.course_name}</span></p>
              
              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    value={enrollForm.student_id}
                    onChange={e => setEnrollForm({...enrollForm, student_id: e.target.value})}
                  >
                    <option value="">Select a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
                
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                  >
                    Confirm Enrollment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {courseForm.id ? 'Edit Course' : 'Add New Course'}
              </h3>
              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={courseForm.name}
                    onChange={e => setCourseForm({...courseForm, name: e.target.value})}
                    placeholder="Advanced Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Teacher</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    value={courseForm.teacher_id}
                    onChange={e => setCourseForm({...courseForm, teacher_id: e.target.value})}
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                    value={courseForm.description}
                    onChange={e => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Course overview and objectives..."
                  />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    {courseForm.id ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher Modal */}
      <AnimatePresence>
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTeacherModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {teacherForm.id ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={teacherForm.name}
                    onChange={e => setTeacherForm({...teacherForm, name: e.target.value})}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={teacherForm.email}
                    onChange={e => setTeacherForm({...teacherForm, email: e.target.value})}
                    placeholder="jane@school.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={teacherForm.subject}
                    onChange={e => setTeacherForm({...teacherForm, subject: e.target.value})}
                    placeholder="Mathematics"
                  />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsTeacherModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    {teacherForm.id ? 'Update Teacher' : 'Add Teacher'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Modal */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStudentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {studentForm.id ? 'Edit Student' : 'Add New Student'}
              </h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={studentForm.name}
                    onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={studentForm.email}
                    onChange={e => setStudentForm({...studentForm, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={studentForm.grade}
                    onChange={e => setStudentForm({...studentForm, grade: e.target.value})}
                  >
                    <option value="">Select Grade</option>
                    <option value="9th">9th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="11th">11th Grade</option>
                    <option value="12th">12th Grade</option>
                  </select>
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    {studentForm.id ? 'Update Student' : 'Add Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function DataTable({ headers, data, onEdit, onDelete, onEnroll, onViewStudents, onViewDetails }: { headers: string[], data: any[][], onEdit?: (index: number) => void, onDelete?: (index: number) => void, onEnroll?: (index: number) => void, onViewStudents?: (index: number) => void, onViewDetails?: (index: number) => void }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4">{h}</th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-slate-600">
                    {j === 0 ? (
                      <span className="font-medium text-slate-900">{cell}</span>
                    ) : headers[j] === 'Subject' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  {onViewDetails && (
                    <button 
                      onClick={() => onViewDetails(i)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  )}
                  {onViewStudents && (
                    <button 
                      onClick={() => onViewStudents(i)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Students
                    </button>
                  )}
                  {onEnroll && (
                    <button 
                      onClick={() => onEnroll(i)}
                      className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                    >
                      Enroll
                    </button>
                  )}
                  <button 
                    onClick={() => onEdit?.(i)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete?.(i)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentDetails({ student, enrollments, onBack }: { student: Student, enrollments: Enrollment[], onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <LogOut size={20} className="rotate-180" />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
            <p className="text-slate-500">Student Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Information</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Full Name</p>
                  <p className="text-sm font-medium text-slate-900">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="text-sm font-medium text-slate-900">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Grade Level</p>
                  <p className="text-sm font-medium text-slate-900">{student.grade}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Enrolled Courses</h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {enrollments.length} Courses
              </span>
            </div>
            
            {enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-4">Course Name</th>
                      <th className="pb-4">Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {enrollments.map(e => (
                      <tr key={e.id}>
                        <td className="py-4 text-sm font-medium text-slate-900">{e.course_name}</td>
                        <td className="py-4 text-sm text-slate-500">{e.enrollment_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500">No courses enrolled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
