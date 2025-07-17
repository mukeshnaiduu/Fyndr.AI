import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import VideoPlayer from './components/VideoPlayer';
import CourseTabNavigation from './components/CourseTabNavigation';
import CourseOverview from './components/CourseOverview';
import CourseModules from './components/CourseModules';
import DiscussionForum from './components/DiscussionForum';
import CourseResources from './components/CourseResources';
import ProgressTracker from './components/ProgressTracker';
import AITranscriptPanel from './components/AITranscriptPanel';
import InteractiveQuiz from './components/InteractiveQuiz';
import AICareerCoachChat from './components/AICareerCoachChat';

const CourseDetailLearningInterface = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quizScores, setQuizScores] = useState({}); // { moduleIndex: score }
  const [lastQuizScore, setLastQuizScore] = useState(null);

  // Mock course data
  const courseData = {
    id: 1,
    title: "Advanced React Patterns & Performance",
    description: `Master advanced React concepts including render props, higher-order components, compound components, and performance optimization techniques. This comprehensive course covers modern React patterns used in production applications, with hands-on projects and real-world examples.\n\nYou'll learn to build scalable, maintainable React applications using industry best practices and advanced patterns that will set you apart as a React developer.`,
    instructor: {
      name: "Sarah Chen",
      title: "Senior React Developer at Meta",
      bio: "Sarah has 8+ years of experience building large-scale React applications. She's contributed to React core and has taught thousands of developers worldwide.",
      students: "45,230",
      courses: "12"
    },
    duration: "8 hours 45 minutes",
    studentsCount: "12,450",
    rating: 4.8,
    level: "Advanced",
    progress: 65,
    objectives: [
      "Master render props and higher-order components",
      "Implement compound component patterns",
      "Optimize React app performance with profiling",
      "Build reusable component libraries",
      "Handle complex state management scenarios",
      "Apply advanced testing strategies"
    ],
    currentVideo: {
      title: "Module 3: Compound Components Pattern",
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
    }
  };

  const moduleData = [
    {
      title: "Introduction to Advanced Patterns",
      description: "Overview of advanced React patterns and when to use them",
      duration: 120,
      lessons: [
        { title: "Course Overview", type: "video", duration: 15, completed: true, current: false },
        { title: "Pattern Categories", type: "video", duration: 25, completed: true, current: false },
        { title: "Setup & Prerequisites", type: "reading", duration: 10, completed: true, current: false },
        { title: "Knowledge Check", type: "quiz", duration: 15, completed: true, current: false }
      ]
    },
    {
      title: "Render Props Pattern",
      description: "Learn to share code between components using render props",
      duration: 180,
      lessons: [
        { title: "What are Render Props?", type: "video", duration: 20, completed: true, current: false },
        { title: "Building a Render Prop Component", type: "video", duration: 35, completed: true, current: false },
        { title: "Advanced Render Props", type: "video", duration: 30, completed: false, current: false },
        { title: "Practice Exercise", type: "assignment", duration: 45, completed: false, current: false }
      ]
    },
    {
      title: "Compound Components",
      description: "Create flexible component APIs with compound patterns",
      duration: 200,
      lessons: [
        { title: "Compound Component Basics", type: "video", duration: 25, completed: false, current: true },
        { title: "Context API Integration", type: "video", duration: 40, completed: false, current: false },
        { title: "Real-world Examples", type: "video", duration: 35, completed: false, current: false },
        { title: "Build a Modal System", type: "assignment", duration: 60, completed: false, current: false }
      ]
    }
  ];

  const progressData = {
    overall: 65,
    completedLessons: 8,
    totalLessons: 24,
    timeSpent: "12h 30m",
    streak: 7,
    averageScore: 87,
    weeklyProgress: 8,
    weeklyGoal: 12,
    quizPerformance: 85,
    assignmentCompletion: 75
  };

  const skillsData = [
    { name: "React Patterns", progress: 75, color: "text-primary", icon: "Code" },
    { name: "Performance", progress: 60, color: "text-accent", icon: "Zap" },
    { name: "Testing", progress: 45, color: "text-success", icon: "CheckCircle" },
    { name: "Architecture", progress: 80, color: "text-warning", icon: "Layers" }
  ];

  const badgesData = [
    { name: "Early Bird", icon: "Sunrise", description: "Completed 3 lessons before 9am", unlocked: true },
    { name: "Speed Learner", icon: "Zap", description: "Completed 5 lessons in one day", unlocked: true },
    { name: "Perfect Quiz", icon: "Award", description: "Scored 100% on a quiz", unlocked: false },
    { name: "Consistent", icon: "Calendar", description: "Maintained a 7-day streak", unlocked: true }
  ];

  // Discussion forum data
  const discussionData = [
    {
      id: 1,
      user: {
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        role: "Student"
      },
      timestamp: "2 days ago",
      content: "I'm struggling with the concept of render props versus custom hooks. When would you use one over the other?",
      likes: 12,
      replies: [
        {
          id: 101,
          user: {
            name: "Sarah Chen",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
            role: "Instructor"
          },
          timestamp: "1 day ago",
          content: "Great question! Render props are great when you want to control what gets rendered while reusing behavior. Custom hooks are better when you just want to extract and reuse logic without affecting the render output directly. I'll cover this more in module 4!",
          likes: 8
        },
        {
          id: 102,
          user: {
            name: "Maya Patel",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
            role: "Student"
          },
          timestamp: "16 hours ago",
          content: "I found this article that compares the two approaches in depth: [link]. It really helped me understand when to use each pattern.",
          likes: 5
        }
      ]
    },
    {
      id: 2,
      user: {
        name: "Jordan Lee",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
        role: "Student"
      },
      timestamp: "3 days ago",
      content: "Is anyone else having trouble with the practice exercise for compound components? I'm not sure how to pass the correct context to nested components.",
      likes: 7,
      replies: []
    }
  ];

  // Resources data
  const resourcesData = [
    {
      id: 1,
      title: "React Patterns Cheat Sheet",
      type: "pdf",
      size: "2.4 MB",
      description: "Quick reference guide for all the patterns covered in this course"
    },
    {
      id: 2,
      title: "Advanced React GitHub Repo",
      type: "link",
      description: "Course code examples and starter templates"
    },
    {
      id: 3,
      title: "Performance Benchmarking Tool",
      type: "tool",
      description: "Tool for measuring React component performance"
    },
    {
      id: 4,
      title: "Compound Components Diagram",
      type: "image",
      size: "800 KB",
      description: "Visual representation of compound component relationships"
    }
  ];

  // Transcript data
  const transcriptData = [
    { time: 0, text: "Welcome to module 3 where we'll be diving into compound components." },
    { time: 12, text: "Compound components are a pattern that helps us create more expressive and flexible component APIs." },
    { time: 28, text: "The main idea is to create components that work together to accomplish a task." },
    { time: 42, text: "Think of it like HTML's select and option tags - they're designed to work together, with select managing the state." },
    { time: 65, text: "Let's look at a practical example of how we might implement this pattern." },
    { time: 80, text: "First, we'll create a parent component that manages the state and provides context to its children..." },
    { time: 100, text: "Then we'll create child components that consume this context and render appropriately." },
    { time: 125, text: "The key benefit is that users of your component have complete control over composition..." },
    { time: 150, text: "...while the parent component handles the complex logic and state management." }
  ];

  // Quiz data
  const quizData = {
    title: "Module 3 Quiz - Compound Components",
    questions: [
      {
        id: 1,
        question: "What is the primary benefit of using compound components?",
        options: [
          "It improves application performance",
          "It provides a more flexible and expressive API",
          "It reduces bundle size",
          "It removes the need for context"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "How do compound components typically share state?",
        options: [
          "Through props drilling",
          "Using Redux",
          "Using React Context",
          "Using global variables"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "Which HTML elements demonstrate the compound component pattern?",
        options: [
          "<div> and <span>",
          "<input> and <label>",
          "<select> and <option>",
          "All of the above"
        ],
        correctAnswer: 2
      }
    ]
  };

  // Event handlers
  const handleModuleSelect = (moduleIndex) => {
    console.log(`Selected module ${moduleIndex}`);
  };

  const handleLessonSelect = (moduleIndex, lessonIndex) => {
    console.log(`Selected lesson ${lessonIndex} in module ${moduleIndex}`);
  };

  const handleVideoProgress = (time) => {
    setCurrentVideoTime(time);
  };

  const handleSeekTo = (time) => {
    setCurrentVideoTime(time);
    // In a real app, would call a method on the video player component
  };

  const handleQuizComplete = (score, answers) => {
    setQuizScores((prev) => ({ ...prev, 2: score }));
    setLastQuizScore(score);
    setShowQuiz(false);
  };

  const handleSkillClick = (skill) => {
    console.log(`Clicked skill: ${skill.name}`);
  };

  const handleAddDiscussion = (discussionText) => {
    console.log(`New discussion: ${discussionText}`);
  };

  const handleAddReply = (discussionId, replyText) => {
    console.log(`New reply to discussion ${discussionId}: ${replyText}`);
  };

  return (
    <MainLayout
      title="Course: Advanced React Patterns & Performance"
      description="Learn advanced React patterns and performance optimization techniques"
      fullWidth
      noPadding
    >
      <SidebarLayout
        sidebarWidth={300}
        sidebar={
          <div className="h-full bg-card/30 transition-all duration-300 w-[300px] min-w-[300px]">
            <div className="flex items-center justify-between p-4">
            <h2 className="font-semibold truncate transition-opacity duration-200">Course Content</h2>
            </div>
            <div className="overflow-y-auto transition-all duration-200 h-[calc(100%-56px)]">
              <CourseModules
                modules={moduleData}
                currentModule={2}
                onModuleSelect={handleModuleSelect}
                onLessonSelect={handleLessonSelect}
                compact
                quizScores={quizScores}
              />
            </div>
          </div>
        }
        contentClassName="bg-card/20 backdrop-blur-sm"
      >
        <div className="min-h-screen">
          {/* Top Navigation */}
          <div className="bg-card/30 p-4">
            <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
              <div className="flex items-center space-x-4">
                <Link to="/resource-library" className="flex items-center text-sm font-medium">
                  <Icon name="ChevronLeft" size={16} className="mr-1" />
                  Back to Resources
                </Link>
                <div className="h-4 w-px bg-white/20" />
                <div className="text-sm font-medium text-muted-foreground">Module 3 of 8</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuiz(true)}
                  iconName="FileCheck"
                  iconPosition="left"
                >
                  Take Quiz
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  Next Lesson
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 py-8 xl:pr-[360px]"> 
            {/* Course Title & Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {courseData.title}
              </h1>
              <div className="flex items-center flex-wrap gap-y-2">
                <div className="flex items-center mr-6 text-sm">
                  <Icon name="User" size={16} className="mr-2 text-muted-foreground" />
                  <span>{courseData.instructor.name}</span>
                </div>
                <div className="flex items-center mr-6 text-sm">
                  <Icon name="Star" size={16} className="mr-2 text-yellow-500" />
                  <span>{courseData.rating} ({courseData.studentsCount} students)</span>
                </div>
                <div className="flex items-center mr-6 text-sm">
                  <Icon name="Clock" size={16} className="mr-2 text-muted-foreground" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon name="BarChart2" size={16} className="mr-2 text-muted-foreground" />
                  <span>{courseData.level}</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="mb-8">
              <div className="rounded-lg overflow-hidden w-full xl:max-w-[900px] aspect-video">
                <VideoPlayer
                  videoUrl={courseData.currentVideo.url}
                  title={courseData.currentVideo.title}
                  onProgressUpdate={handleVideoProgress}
                  currentTime={currentVideoTime}
                />
              </div>
            </div>

            {/* Course Content Tabs */}
            <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'overview' && (
                <CourseOverview course={courseData} />
              )}
              
              {activeTab === 'modules' && (
                <CourseModules
                  modules={moduleData}
                  currentModule={2}
                  onModuleSelect={handleModuleSelect}
                  onLessonSelect={handleLessonSelect}
                />
              )}
              
              {activeTab === 'discussion' && Array.isArray(discussionData) && (
                <DiscussionForum
                  discussions={discussionData}
                  onAddDiscussion={handleAddDiscussion}
                  onAddReply={handleAddReply}
                />
              )}
              
              {activeTab === 'resources' && (
                <CourseResources resources={resourcesData} />
              )}
            </CourseTabNavigation>
          </div>
          {/* Right Sidebar - Progress Tracker */}
          <div className="hidden xl:block w-[340px] fixed right-0 top-16 min-h-[calc(100vh-4rem)] backdrop-blur-md z-30">
            <ProgressTracker
              progress={progressData}
              skills={skillsData}
              badges={badgesData}
              onSkillClick={handleSkillClick}
            />
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
          <Button
            variant="default"
            size="icon"
            onClick={() => setShowAICoach(true)}
            className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            title="AI Career Coach"
          >
            <Icon name="MessageCircle" size={20} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTranscript(true)}
            className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            title="View Transcript"
          >
            <Icon name="FileText" size={20} />
          </Button>
        </div>
      </SidebarLayout>

      {/* Modals and Overlays */}
      <AITranscriptPanel
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
        transcript={transcriptData}
        onSeekTo={handleSeekTo}
        currentTime={currentVideoTime}
      />

      {showQuiz && (
        <InteractiveQuiz
          quiz={quizData}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      <AICareerCoachChat
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        courseContext={courseData}
      />

      {/* Show quiz score after taking quiz, styled like quiz result */}
      {lastQuizScore !== null && !showQuiz && (
        <InteractiveQuiz
          quiz={quizData}
          onComplete={() => setLastQuizScore(null)}
          onClose={() => setLastQuizScore(null)}
          showResultsOnly={true}
          score={lastQuizScore}
        />
      )}
    </MainLayout>
  );
};

export default CourseDetailLearningInterface;
