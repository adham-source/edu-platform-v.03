import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

interface Lesson {
  _id: string;
  title: string;
  order: number;
  contentType: 'video' | 'text' | 'quiz';
  isFree: boolean;
  status?: string; // For video lessons
}

const Lessons: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: lessons, isLoading, isError, error } = useQuery<Lesson[], Error>({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is missing');
      const response = await apiClient.get<Lesson[]>(`/lessons/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId, // Only run query if courseId is available
  });

  if (!courseId) {
    return <div className="p-4 text-red-500">Please select a course to view lessons.</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading lessons...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lessons for Course ID: {courseId}</h1>
      <div className="mb-4">
        <Link to={`/courses/${courseId}/lessons/new`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Lesson
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Order</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Free</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons?.map((lesson) => (
              <tr key={lesson._id}>
                <td className="py-2 px-4 border-b">{lesson.title}</td>
                <td className="py-2 px-4 border-b">{lesson.order}</td>
                <td className="py-2 px-4 border-b">{lesson.contentType}</td>
                <td className="py-2 px-4 border-b">{lesson.isFree ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">{lesson.status || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <Link to={`/courses/${courseId}/lessons/${lesson._id}/edit`} className="text-blue-600 hover:underline mr-2">Edit</Link>
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

export default Lessons;
