import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI, enrollmentsAPI } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface CourseType {
  _id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  isPublished: boolean;
  instructor: { username: string; email: string };
  thumbnail?: string;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  category: string;
  level: string;
  duration: number;
}

const Courses: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const { data: coursesData, isLoading, isError, error } = useQuery({
    queryKey: ['courses', searchTerm, selectedCategory, selectedLevel],
    queryFn: async () => {
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        page: 1,
        limit: 12
      };
      const response = await coursesAPI.getCourses(params);
      return response.data;
    },
  });

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollmentsAPI.enroll(courseId);
      alert('تم التسجيل في الدورة بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء التسجيل في الدورة');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">حدث خطأ في تحميل الدورات</div>
          <p className="text-gray-600">{error?.message}</p>
        </div>
      </div>
    );
  }

  const courses = coursesData?.courses || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الدورات التدريبية</h1>
            <p className="text-gray-600">اكتشف مجموعة واسعة من الدورات التعليمية المتخصصة</p>
          </div>
          {hasRole('teacher') || hasRole('admin') ? (
            <Link
              to="/courses/new"
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              إنشاء دورة جديدة
            </Link>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
            <input
              type="text"
              placeholder="ابحث عن دورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع التصنيفات</option>
              <option value="programming">البرمجة</option>
              <option value="design">التصميم</option>
              <option value="business">الأعمال</option>
              <option value="marketing">التسويق</option>
              <option value="languages">اللغات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المستوى</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع المستويات</option>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-xl mb-4">لا توجد دورات متاحة</div>
          <p className="text-gray-400">جرب تغيير معايير البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: CourseType) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Course Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level === 'beginner' ? 'مبتدئ' : 
                     course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">{course.rating.toFixed(1)} ({course.ratingCount})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">المدرب: {course.instructor.username}</span>
                  <span className="text-sm text-gray-500">{course.enrollmentCount} طالب</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.price === 0 ? 'مجاني' : `$${course.price}`}
                  </div>
                  <div className="flex space-x-2">
                    {hasRole('student') && (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        التسجيل
                      </button>
                    )}
                    {(hasRole('teacher') || hasRole('admin')) && (
                      <Link
                        to={`/courses/${course._id}/edit`}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        تعديل
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {coursesData?.pagination && coursesData.pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: coursesData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg ${
                  page === coursesData.pagination.currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
