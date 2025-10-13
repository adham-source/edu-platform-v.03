import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

interface CourseFormProps {
  course?: Course;
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  isPublished: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ course: initialCourse }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();

  const [course, setCourse] = useState<Course>(initialCourse || {
    title: '',
    description: '',
    price: 0,
    tags: [],
    isPublished: false,
  });

  useEffect(() => {
    if (initialCourse) {
      setCourse(initialCourse);
    }
  }, [initialCourse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setCourse(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'tags') {
      setCourse(prev => ({ ...prev, [name]: value.split(',').map(tag => tag.trim()) }));
    } else {
      setCourse(prev => ({ ...prev, [name]: value }));
    }
  };

  const createCourseMutation = useMutation({
    mutationFn: (newCourse: Course) => apiClient.post('/courses', newCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate('/courses');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (updatedCourse: Course) => apiClient.put(`/courses/${id}`, updatedCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate('/courses');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateCourseMutation.mutate(course);
    } else {
      createCourseMutation.mutate(course);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Course' : 'Create Course'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={course.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            name="description"
            value={course.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={course.price}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={course.tags.join(', ')}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={course.isPublished}
            onChange={handleChange}
            className="mr-2 leading-tight"
          />
          <label htmlFor="isPublished" className="text-gray-700 text-sm font-bold">Published</label>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {id ? 'Update Course' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
        {(createCourseMutation.isPending || updateCourseMutation.isPending) && <p>Saving...</p>}
        {(createCourseMutation.isError || updateCourseMutation.isError) && <p className="text-red-500">Error saving course.</p>}
      </form>
    </div>
  );
};

export default CourseForm;
