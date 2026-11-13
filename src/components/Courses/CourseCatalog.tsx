import React, { useState } from 'react';
import { Course } from '../../types';
import { MOCK_COURSES } from '../../mockData';
import { BookOpen, Search, Play, Users, Clock, Layers, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (course: Course) => void;
  onOpenAITutor: (topic: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse, onOpenAITutor }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Computer Science', 'Software Engineering', 'Design & Media'];

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
            <span>Course Catalog & Video Lectures</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Master Advanced Tech with On-Demand Lectures
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Access HD class recordings, downloadable course slides, interactive syllabus modules, and instant AI tutor homework assistance.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topic, or instructor..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-md'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold text-amber-300">
                  {course.code}
                </span>

                <button
                  onClick={() => onSelectCourse(course)}
                  className="absolute bottom-3 right-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg opacity-90 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 border border-blue-400"
                  title="Start Watching Lecture"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-3">
                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-white/80 font-medium">
                    {course.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center space-x-2.5 pt-2 border-t border-white/10">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <span className="text-xs font-semibold text-white">{course.instructor}</span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-black/30 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-white/70">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{course.enrolledStudents} Enrolled</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                  <span>{course.totalModules} Modules</span>
                </span>
              </div>

              <button
                onClick={() => onSelectCourse(course)}
                className="flex items-center space-x-1 text-xs font-semibold text-white hover:text-white/80 group-hover:translate-x-1 transition-all"
              >
                <span>View Syllabus</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
