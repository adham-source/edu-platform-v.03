import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

interface LessonFormProps {
  lesson?: Lesson;
}

interface Lesson {
  _id?: string;
  title: string;
  order: number;
  contentType: 'video' | 'text' | 'quiz';
  textContent?: string;
  isFree: boolean;
  videoFile?: File | null;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson: initialLesson }) => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const queryClient = useQueryClient();

  const [lesson, setLesson] = useState<Lesson>(initialLesson || {
    title: '',
    order: 0,
    contentType: 'text',
    isFree: false,
    textContent: '',
    videoFile: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialLesson) {
      setLesson(initialLesson);
    }
  }, [initialLesson]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setLesson(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      setSelectedFile(file || null);
    } else {
      setLesson(prev => ({ ...prev, [name]: value }));
    }
  };

  const createLessonMutation = useMutation({
    mutationFn: async (newLesson: Lesson) => {
      const formData = new FormData();
      formData.append('courseId', courseId || '');
      formData.append('title', newLesson.title);
      formData.append('order', newLesson.order.toString());
      formData.append('contentType', newLesson.contentType);
      formData.append('isFree', newLesson.isFree.toString());
      if (newLesson.contentType === 'text' && newLesson.textContent) {
        formData.append('textContent', newLesson.textContent);
      }
      if (newLesson.contentType === 'video' && selectedFile) {
        formData.append('video', selectedFile);
      }
      return apiClient.post('/lessons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      navigate(`/courses/${courseId}/lessons`);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async (updatedLesson: Lesson) => {
      const formData = new FormData();
      formData.append('title', updatedLesson.title);
      formData.append('order', updatedLesson.order.toString());
      formData.append('contentType', updatedLesson.contentType);
      formData.append('isFree', updatedLesson.isFree.toString());
      if (updatedLesson.contentType === 'text' && updatedLesson.textContent) {
        formData.append('textContent', updatedLesson.textContent);
      }
      if (updatedLesson.contentType === 'video' && selectedFile) {
        formData.append('video', selectedFile);
      }
      return apiClient.put(`/lessons/${lessonId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      navigate(`/courses/${courseId}/lessons`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonId) {
      updateLessonMutation.mutate(lesson);
    } else {
      createLessonMutation.mutate(lesson);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{lessonId ? 'Edit Lesson' : 'Create Lesson'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={lesson.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="order" className="block text-gray-700 text-sm font-bold mb-2">Order:</label>
          <input
            type="number"
            id="order"
            name="order"
            value={lesson.order}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="contentType" className="block text-gray-700 text-sm font-bold mb-2">Content Type:</label>
          <select
            id="contentType"
            name="contentType"
            value={lesson.contentType}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
        {lesson.contentType === 'text' && (
          <div className="mb-4">
            <label htmlFor="textContent" className="block text-gray-700 text-sm font-bold mb-2">Text Content:</label>
            <textarea
              id="textContent"
              name="textContent"
              value={lesson.textContent || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            />
          </div>
        )}
        {lesson.contentType === 'video' && (
          <div className="mb-4">
            <label htmlFor="videoFile" className="block text-gray-700 text-sm font-bold mb-2">Video File:</label>
            <input
              type="file"
              id="videoFile"
              name="videoFile"
              accept="video/*"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isFree"
            name="isFree"
            checked={lesson.isFree}
            onChange={handleChange}
            className="mr-2 leading-tight"
          />
          <label htmlFor="isFree" className="text-gray-700 text-sm font-bold">Free Lesson</label>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {lessonId ? 'Update Lesson' : 'Create Lesson'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
        {(createLessonMutation.isPending || updateLessonMutation.isPending) && <p>Saving...</p>}
        {(createLessonMutation.isError || updateLessonMutation.isError) && <p className="text-red-500">Error saving lesson.</p>}
      </form>
    </div>
  );
};

export default LessonForm;
