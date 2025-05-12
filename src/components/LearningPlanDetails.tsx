import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTrashAlt, FaBook, FaCalendarAlt, FaLink, FaChevronLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../lib/axiosInstance';
import axios from 'axios';


interface planInterface {
  id: number;
  name: string;
  tag: string | null;
  completedCount: number;
  totalContentCount: number;
  contents: any[]; // You can replace 'any' with a more specific type if you know what contents contain
  userId: number;
  userName: string;
}


const LearningPlanDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the plan id from URL

  // Dummy plan details for now
  const [plan, setPlan] = useState<planInterface>({
    id: 0,
    name: '',
    tag: null,
    completedCount: 0,
    totalContentCount: 0,
    contents: [],
    userId: 0,
    userName: '',
  });

  const [planName, setPlanName] = useState(''); // Your current plan name
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await axiosInstance.get(`/learning-paths/${id}`);
      if(response.data){
        console.log(response.data);
        console.log(response.data?.contents);
        setPlan(response.data);
        setPlanName(response.data?.name);
      }
    }
    fetchPlans();
  } , [])
  // Update progress whenever the topics state changes
  useEffect(() => {
    if (!plan.contents || plan.contents.length === 0)  return;
    const completedTopics = plan.contents.filter((topic) => topic.isChecked).length;
    const newProgress = (completedTopics / plan.contents.length) * 100;
    // console.log();
    setPlan((prevPlan) => ({
      ...prevPlan,
      progress: newProgress,
    }));
  }, [plan.contents]);

  const handleBack = () => {
    navigate('/my-learning-journey');
  };

  const handleEdit = (index: number) => {
    setSelectedTopic(plan.contents[index]);
    setIsEditMode(true);
  };

  const handleDelete = async (index: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this topic?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedTopics = plan.contents.filter((_, i) => i !== index);
        setPlan((prevPlan) => ({
          ...prevPlan,
          topics: updatedTopics,
        }));
        const res = axiosInstance.delete(`/learning-paths/contents/${index}`).then((res) => console.log(res));
        Swal.fire('Deleted!', 'The topic has been deleted.', 'success');
      }
    });
  };

  const handleAddTopic = () => {
    navigate(`/learning-plan/${id}/add-topic`);
  };

  const handleCheckboxChange = (index: number) => {
    const updatedTopics = [...plan.contents];
    updatedTopics[index].isChecked = !updatedTopics[index].isChecked;
    setPlan({ ...plan, contents: updatedTopics });
  };

  const handleSaveChanges = () => {
    // Update the topic in the plan's topics list
    const updatedTopics = plan.contents.map((topic) =>
      topic.title === selectedTopic.title ? selectedTopic : topic
    );
    setPlan((prevPlan) => ({
      ...prevPlan,
      topics: updatedTopics,
    }));
    setIsEditMode(false); // Hide the edit form
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setSelectedTopic({
      ...selectedTopic,
      [field]: e.target.value,
    });
  };

  const handleDeletePlan = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the entire plan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/learning-paths/${id}`);
        // Logic to delete the plan (currently just navigate back)
        Swal.fire('Deleted!', 'The learning plan has been deleted.', 'success');
        navigate('/my-learning-journey');
      }
    });
  };

  const handleEditPlan = () => {
    Swal.fire({
      title: 'Edit Plan Name',
      input: 'text',
      inputLabel: 'New Plan Name',
      inputPlaceholder: 'Enter new plan name',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Plan name cannot be empty!';
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        await axiosInstance.put(`/learning-paths/${id}`, { name: result.value })
        // Update the plan name here
        setPlanName(result.value);
        window.location.reload();
        // setIsEditMode(true);
        Swal.fire('Saved!', 'Your plan name has been updated.', 'success');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-300 mb-4 group"
        >
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Plans</span>
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-800">{plan.name}</h1>
          <div className="space-x-3">
            <button
              onClick={handleEditPlan}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Edit Plan
            </button>
            <button
              onClick={handleDeletePlan}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Delete Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plan Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-1">{plan.name}</h2>
            <p className="text-gray-500 flex items-center gap-2">
             
            </p>
          </div>
          <div className="bg-indigo-100 px-4 py-2 rounded-full">
            <span className="font-semibold text-indigo-800">{Math.round(plan.completedCount)}% Complete</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          {/* <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${plan.completedCount}%` }}
          ></div> */}
        </div>
      </div>

      {/* Learning Topics Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <FaBook className="text-indigo-600" /> Learning Topics
        </h2>
        <button
          onClick={handleAddTopic}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <span>Add Topic</span> <span className="text-xl">+</span>
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {plan.contents && plan.contents.length ? (
          plan.contents.map((topic, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500 hover:shadow-lg hover:translate-x-1 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={topic.isChecked}
                    onChange={() => handleCheckboxChange(index)}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <h3
                  className={`text-lg font-bold ml-3 ${
                    topic.isChecked ? 'line-through text-gray-500' : 'text-indigo-700'
                  } transition-colors duration-300`}
                >
                  {topic.contentTitle}
                </h3>
                {/* Edit and Delete Icons */}
                <div className="ml-auto flex space-x-3">
                  {/* <button 
                    onClick={() => handleEdit(index)} 
                    className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform duration-300"
                    title="Edit Topic"
                  >
                    <FaEdit size={18} />
                  </button> */}
                  <button 
                    onClick={() => handleDelete(index)} 
                    className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform duration-300"
                    title="Delete Topic"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pl-8">
                <p className="text-gray-700 mb-3">{topic.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <FaCalendarAlt className="text-indigo-400" /> 
                    <span>Target: {topic.targetDate}</span>
                  </div>
                  <a
                    href={topic.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    <FaLink className="text-blue-500" /> View Resource
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500 border border-dashed border-gray-300">
            <p className="text-lg">No topics added yet.</p>
            <p className="mt-2">Click "Add Topic" to get started on your learning journey!</p>
          </div>
        )}
      </div>

      {/* Edit Topic Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-96 max-w-md border border-indigo-100 animate-fadeIn">
            <h3 className="text-xl font-bold text-indigo-800 mb-5 border-b pb-3">Edit Topic</h3>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                type="text"
                value={selectedTopic?.title}
                onChange={(e) => handleChange(e, 'title')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                value={selectedTopic?.description}
                onChange={(e) => handleChange(e, 'description')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                rows={3}
              />
            </div>

            {/* Target Date */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Target Date</label>
              <input
                type="date"
                value={selectedTopic?.targetDate}
                onChange={(e) => handleChange(e, 'targetDate')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              />
            </div>

            {/* Resource URL */}
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1">Resource URL</label>
              <input
                type="text"
                value={selectedTopic?.resourceLink}
                onChange={(e) => handleChange(e, 'resourceLink')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanDetails;