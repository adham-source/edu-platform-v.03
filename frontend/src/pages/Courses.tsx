import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  isPublished: boolean;
  instructor: { username: string; email: string };
}

const Courses: React.FC = () => {
  const { data: courses, isLoading, isError, error } = useQuery<Course[], Error>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await apiClient.get<Course[]>('/courses');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading courses...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>
      <div className="mb-4">
        <Link to="/courses/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Course
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Instructor</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Published</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses?.map((course) => (
              <tr key={course._id}>
                <td className="py-2 px-4 border-b">{course.title}</td>
                <td className="py-2 px-4 border-b">{course.instructor.username}</td>
                <td className="py-2 px-4 border-b">${course.price.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{course.isPublished ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">
                  <Link to={`/courses/${course._id}/edit`} className="text-blue-600 hover:underline mr-2">Edit</Link>
                  <Link to={`/courses/${course._id}/lessons`} className="text-green-600 hover:underline mr-2">View Lessons</Link>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
