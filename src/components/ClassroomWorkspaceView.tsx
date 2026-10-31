import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  PlusCircle,
  KeyRound,
  Calendar,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  BarChart3,
  BookOpen,
  Send,
  UserCheck,
} from 'lucide-react';
import {
  Classroom,
  ClassroomAssignment,
  ClassroomSubmission,
  UserClassroomRole,
  ExamBoard,
} from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface ClassroomWorkspaceViewProps {
  onLaunchAssignmentQuiz?: (quizTitle: string, subject: string) => void;
}

const STORAGE_KEY_CLASSROOMS = 'quizme_classrooms_v1';
const STORAGE_KEY_ASSIGNMENTS = 'quizme_assignments_v1';
const STORAGE_KEY_SUBMISSIONS = 'quizme_submissions_v1';

export const ClassroomWorkspaceView: React.FC<ClassroomWorkspaceViewProps> = ({
  onLaunchAssignmentQuiz,
}) => {
  const [role, setRole] = useState<UserClassroomRole>('teacher');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Classrooms State
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSROOMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse classrooms', e);
    }
    return [
      {
        id: 'class_waec_2026',
        code: 'WAEC-82',
        name: 'WASSCE 2026 Distinction Physics & Math',
        teacherId: 'teacher_1',
        teacherName: 'Dr. Adeyemi (Chief Examiner)',
        subject: 'Physics & General Mathematics',
        examBoard: 'WAEC',
        studentCount: 28,
        activeAssignmentsCount: 2,
        averageAccuracy: 76,
        createdAt: '2026-03-01',
      },
      {
        id: 'class_cambridge_a',
        code: 'CAIE-44',
        name: 'Cambridge A-Level Pure Mathematics',
        teacherId: 'teacher_1',
        teacherName: 'Dr. Adeyemi (Chief Examiner)',
        subject: 'Mathematics (9709)',
        examBoard: 'Cambridge_ALevel',
        studentCount: 19,
        activeAssignmentsCount: 1,
        averageAccuracy: 82,
        createdAt: '2026-03-10',
      },
    ];
  });

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(classrooms[0]?.id || '');

  // Assignments State
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse assignments', e);
    }
    return [
      {
        id: 'asgn_1',
        classroomId: 'class_waec_2026',
        title: 'WAEC Section B: Kinematics & Free Fall Dynamics',
        description: 'Complete the 10-question structured past paper assessment. Method marks awarded.',
        assignmentType: 'exam_paper',
        subject: 'Physics',
        examBoard: 'WAEC',
        dueDate: '2026-11-08T23:59:00Z',
        totalPoints: 50,
        createdAt: '2026-03-25',
      },
      {
        id: 'asgn_2',
        classroomId: 'class_waec_2026',
        title: 'Quadratic Curves & Parabola Tangent Roots',
        description: 'Solve the algebraic quadratic systems and analyze vertex forms.',
        assignmentType: 'quiz',
        subject: 'General Mathematics',
        examBoard: 'WAEC',
        dueDate: '2026-11-12T23:59:00Z',
        totalPoints: 40,
        createdAt: '2026-03-28',
      },
    ];
  });

  // Student Submissions State
  const [submissions, setSubmissions] = useState<ClassroomSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse submissions', e);
    }
    return [
      {
        id: 'sub_1',
        assignmentId: 'asgn_1',
        studentId: 'stud_101',
        studentName: 'Chiamaka Okafor',
        score: 46,
        maxScore: 50,
        percentage: 92,
        submittedAt: '2026-03-29T14:20:00Z',
        status: 'graded',
        teacherFeedback: 'Outstanding working and correct SI units throughout.',
        misconceptionsEncountered: [],
      },
      {
        id: 'sub_2',
        assignmentId: 'asgn_1',
        studentId: 'stud_102',
        studentName: 'Tunde Bakare',
        score: 38,
        maxScore: 50,
        percentage: 76,
        submittedAt: '2026-03-30T10:15:00Z',
        status: 'graded',
        teacherFeedback: 'Watch out for signs in gravitational acceleration equations.',
        misconceptionsEncountered: ['Air resistance confused with terminal speed'],
      },
    ];
  });

  // Modals / Form toggles
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Physics');
  const [newClassBoard, setNewClassBoard] = useState<ExamBoard>('WAEC');

  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [newAsgnTitle, setNewAsgnTitle] = useState('');
  const [newAsgnDesc, setNewAsgnDesc] = useState('');
  const [newAsgnDueDate, setNewAsgnDueDate] = useState('');

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinSuccessMessage, setJoinSuccessMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Failed to persist classroom data', e);
    }
  }, [classrooms, assignments, submissions]);

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];
  const activeAssignments = assignments.filter((a) => a.classroomId === activeClassroom?.id);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    soundFx.playPop();
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const newCode = `${newClassBoard.substring(0, 4).toUpperCase()}-${randomSuffix}`;
    const newClass: Classroom = {
      id: `class_${Date.now()}`,
      code: newCode,
      name: newClassName.trim(),
      teacherId: 'teacher_current',
      teacherName: 'Classroom Lead',
      subject: newClassSubject,
      examBoard: newClassBoard,
      studentCount: 1,
      activeAssignmentsCount: 0,
      averageAccuracy: 0,
      createdAt: new Date().toISOString(),
    };

    setClassrooms([newClass, ...classrooms]);
    setSelectedClassroomId(newClass.id);
    setIsCreatingClass(false);
    setNewClassName('');
    soundFx.playComplete();
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgnTitle.trim() || !activeClassroom) return;

    const newAsgn: ClassroomAssignment = {
      id: `asgn_${Date.now()}`,
      classroomId: activeClassroom.id,
      title: newAsgnTitle.trim(),
      description: newAsgnDesc.trim() || 'Review syllabus requirements and complete assessment.',
      assignmentType: 'quiz',
      subject: activeClassroom.subject,
      examBoard: activeClassroom.examBoard,
      dueDate: newAsgnDueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      totalPoints: 50,
      createdAt: new Date().toISOString(),
    };

    setAssignments([newAsgn, ...assignments]);
    setIsCreatingAssignment(false);
    setNewAsgnTitle('');
    setNewAsgnDesc('');
    soundFx.playCorrect();
  };

  const handleJoinClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = classrooms.find((c) => c.code.toUpperCase() === code);
    if (found) {
      setSelectedClassroomId(found.id);
      setJoinSuccessMessage(`Successfully enrolled in ${found.name}!`);
      soundFx.playComplete();
    } else {
      setJoinSuccessMessage(`Enrolled with code ${code}! (Simulated student access granted)`);
      soundFx.playCorrect();
    }
    setJoinCodeInput('');
    setTimeout(() => setJoinSuccessMessage(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner & Role Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
              <span>Collaborative Learning Syndicate</span>
              <span aria-hidden="true">·</span>
              <span>Classroom Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Classroom & Teacher Workspace
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Distribute examination assignments, monitor student submissions, identify class-wide misconceptions,
              and invite scholars through 6-character room codes.
            </p>
          </div>

          {/* Teacher vs Student Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setRole('teacher');
                soundFx.playClick();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'teacher'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Teacher View
            </button>
            <button
              onClick={() => {
                setRole('student');
                soundFx.playClick();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Student View
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Selection Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Your Classrooms:
          </span>
          {classrooms.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedClassroomId(c.id);
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                c.id === activeClassroom?.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {role === 'teacher' ? (
            <button
              onClick={() => setIsCreatingClass(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Classroom</span>
            </button>
          ) : (
            <form onSubmit={handleJoinClassroom} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter 6-char code (e.g. WAEC-82)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {joinSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{joinSuccessMessage}</span>
        </div>
      )}

      {/* Active Classroom Overview */}
      {activeClassroom && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{activeClassroom.examBoard.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span>{activeClassroom.subject}</span>
                <span aria-hidden="true">·</span>
                <span>Instructor: {activeClassroom.teacherName}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeClassroom.name}</h2>
            </div>

            {/* Room Invite Code Box */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Class Access Code</div>
                <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {activeClassroom.code}
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(activeClassroom.code)}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                title="Copy code"
              >
                {copiedCode === activeClassroom.code ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">Enrolled Students</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {activeClassroom.studentCount}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Assignments</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {activeAssignments.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">Class Accuracy</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {activeClassroom.averageAccuracy}%
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Classroom Assignments
              </h3>
              {role === 'teacher' && (
                <button
                  onClick={() => setIsCreatingAssignment(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Assign New Assessment</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activeAssignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No assignments yet. Click &quot;Assign New Assessment&quot; to publish work for your students.
                </div>
              ) : (
                activeAssignments.map((asgn) => (
                  <div
                    key={asgn.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{asgn.title}</span>
                        <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {asgn.assignmentType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{asgn.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {new Date(asgn.dueDate).toLocaleDateString()}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{asgn.totalPoints} Points</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {role === 'student' ? (
                        <button
                          onClick={() => {
                            if (onLaunchAssignmentQuiz) {
                              onLaunchAssignmentQuiz(asgn.title, asgn.subject);
                            }
                          }}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Start Assignment</span>
                        </button>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {submissions.filter((s) => s.assignmentId === asgn.id).length} Submissions
                          </div>
                          <span className="text-[11px] text-emerald-600 font-medium">All Graded</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teacher Student Submissions Table */}
          {role === 'teacher' && submissions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Student Submissions:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Student</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Examiner Feedback</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {sub.studentName}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {sub.score}/{sub.maxScore} ({sub.percentage}%)
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-600 font-semibold capitalize flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 italic">
                          {sub.teacherFeedback}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Classroom */}
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Classroom</h3>
            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WAEC 2026 Biology Mastery"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassSubject}
                    onChange={(e) => setNewClassSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Board
                  </label>
                  <select
                    value={newClassBoard}
                    onChange={(e) => setNewClassBoard(e.target.value as ExamBoard)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="WAEC">WAEC</option>
                    <option value="JAMB">JAMB</option>
                    <option value="Cambridge_IGCSE">Cambridge IGCSE</option>
                    <option value="Cambridge_ALevel">Cambridge A-Level</option>
                    <option value="SAT">SAT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingClass(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create & Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {isCreatingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Circle Theorems & Alternate Segments Exam Drill"
                  value={newAsgnTitle}
                  onChange={(e) => setNewAsgnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Instructions & Criteria
                </label>
                <textarea
                  rows={3}
                  value={newAsgnDesc}
                  onChange={(e) => setNewAsgnDesc(e.target.value)}
                  placeholder="Instructions for students (e.g. Show full working for method marks)..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newAsgnDueDate}
                  onChange={(e) => setNewAsgnDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingAssignment(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Publish to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
