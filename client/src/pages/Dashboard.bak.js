import React, { useContext, useEffect, useState } from 'react';
import { AuthCo  const handleImprove = async (note) => {
    setImprovingNoteId(note._id);
    try {
      // Get the saved prompt or use default
      const savedPrompt = localStorage.getItem('customAIPrompt') || customPrompt;
      const response = await improveNote(note.content, token, savedPrompt);
      const improved = response.improved?.parts?.map(p => p.text).join('') || response.improved || ''; } from '../context/AuthContext';
import { getNotes, deleteNote, updateNote, improveNote } from '../services/noteService';
import { FileText, Edit, Trash2, Wand2, X, Save, Check, Copy, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const token = user?.token;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [improvingNoteId, setImprovingNoteId] = useState(null);
  const [improvedContent, setImprovedContent] = useState('');
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('Improve this text with better grammar and clarity:');

  useEffect(() => {
    if (!token) return;

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const data = await getNotes(token);
        if (Array.isArray(data)) {
          setNotes(data);
        } else if (data.notes && Array.isArray(data.notes)) {
          setNotes(data.notes);
        } else {
          setNotes([]);
        }
        setError('');
      } catch (err) {
        console.error('Failed to fetch notes:', err);
        setError('Failed to load notes.');
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token]);

  // When activeNote changes, reset modal fields
  useEffect(() => {
    if (activeNote) {
      setModalTitle(activeNote.title);
      setModalContent(activeNote.content);
      setModalEditMode(false);
      setImprovedContent('');
    }
  }, [activeNote]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await deleteNote(id, token);
      setShowModal(false);
      setActiveNote(null);
      // Refresh notes
      const data = await getNotes(token);
      setNotes(data);
    } catch {
      setError('Failed to delete note.');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (note) => {
    setImprovingNoteId(note._id);
    try {
      const response = await improveNote(note.content, token, customPrompt);
      const improved = response.improved?.parts?.map(p => p.text).join('') || response.improved || '';
      setImprovedContent(improved);
      setActiveNote(note);
      setShowModal(true);
    } catch {
      setError('Failed to improve note.');
    } finally {
      setImprovingNoteId(null);
    }
  };

  const handleModalSave = async () => {
    if (!modalTitle.trim() || !modalContent.trim()) {
      setError('Both title and content are required.');
      return;
    }
    setLoading(true);
    try {
      await updateNote(activeNote._id, { title: modalTitle, content: modalContent }, token);
      // Refresh notes
      const data = await getNotes(token);
      setNotes(data);
      setShowModal(false);
      setActiveNote(null);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-white to-blue-50 shadow-lg rounded-2xl p-8 mb-10 border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-700 text-lg mb-2">Your personal smart notebook powered by AI.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/notes')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <FileText size={20} />
          Create New Note
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading notes...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : notes.length === 0 ? (
        <p className="text-center text-gray-500">No notes yet. Click "Create New Note" to add one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((note) => (
            <div
              key={note._id}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between transition-all duration-200 border border-gray-100 hover:border-blue-200"
              onClick={() => { setActiveNote(note); setShowModal(true); }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> {note.title}
                  </h2>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNote(note);
                        setModalEditMode(true);
                        setShowModal(true);
                      }}
                      className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Note"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note._id);
                      }}
                      className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed mb-6">{note.content}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImprove(note);
                  }}
                  className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg 
                    ${improvingNoteId === note._id
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200'} 
                    transition-colors`}
                  disabled={improvingNoteId === note._id}
                >
                  <Wand2 size={16} className={improvingNoteId === note._id ? 'animate-spin' : ''} />
                  {improvingNoteId === note._id ? 'Improving...' : 'Improve with AI'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && activeNote && (
        <div className="fixed inset-0 bg-gray-900/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
            {modalEditMode ? (
              <>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full border-0 border-b-2 border-gray-200 p-3 mb-6 text-xl font-medium focus:outline-none focus:border-blue-500 bg-transparent"
                />
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setModalEditMode(false)}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalSave}
                    disabled={loading || !modalTitle.trim() || !modalContent.trim()}
                    className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-white transition-all duration-200
                      ${loading || !modalTitle.trim() || !modalContent.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{modalTitle}</h2>
                <div className="h-px bg-gradient-to-r from-blue-500 to-transparent mb-6"></div>
                <p className="mb-6 whitespace-pre-wrap text-gray-700 leading-relaxed">{modalContent}</p>

                {improvedContent && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-6 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 size={20} className="text-green-600" />
                      <h4 className="text-lg font-semibold text-green-800">AI Suggested Improvement</h4>
                    </div>
                    <div className="bg-white/50 p-4 rounded-lg border border-green-100">
                      <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{improvedContent}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalEditMode(true)}
                      className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-colors"
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activeNote._id)}
                      className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                    {!improvedContent && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImprove(activeNote)}
                          disabled={improvingNoteId === activeNote._id}
                          className={`text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-colors
                            ${improvingNoteId === activeNote._id ? 'opacity-75 cursor-wait' : ''}`}
                        >
                          <Wand2 size={18} className={improvingNoteId === activeNote._id ? 'animate-spin' : ''} />
                          {improvingNoteId === activeNote._id ? 'Improving...' : 'Improve with AI'}
                        </button>
                        <button
                          onClick={() => setShowPromptSettings(true)}
                          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Change AI Prompt"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {improvedContent && (
                      <>
                        <button
                          onClick={async () => {
                            await updateNote(activeNote._id, { title: activeNote.title, content: improvedContent }, token);
                            const data = await getNotes(token);
                            setNotes(data);
                            setShowModal(false);
                            setImprovedContent('');
                            setActiveNote(null);
                          }}
                          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Check size={18} /> Apply Changes
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(improvedContent)}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Copy size={18} /> Copy
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setImprovedContent('');
                        setActiveNote(null);
                      }}
                      className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <X size={18} /> Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Prompt Settings Dialog */}
          {showPromptSettings && (
            <div className="fixed inset-0 bg-gray-900/60 flex justify-center items-center z-[60] p-4">
              <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">AI Prompt Settings</h3>
                  <button
                    onClick={() => setShowPromptSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customize AI Prompt
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="Enter your custom prompt here..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This prompt will be used to guide the AI in improving your notes.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPromptSettings(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptSettings(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
