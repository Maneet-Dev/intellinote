import React, { useEffect, useState } from 'react';
import { getNotes, createNote, deleteNote, updateNote, improveNote as improveNoteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import { Plus, Save, Trash2, Edit, X, Wand2, FileText, Check, Copy, Settings } from 'lucide-react';

function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [improvingNoteId, setImprovingNoteId] = useState(null);
  const [improvedContent, setImprovedContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(() => {
    return localStorage.getItem('customAIPrompt') || 'Improve this text with better grammar and clarity:';
  });

  useEffect(() => {
    if (user?.token) loadNotes();
  }, [user]);

  useEffect(() => {
    if (activeNote) {
      setModalTitle(activeNote.title);
      setModalContent(activeNote.content);
      setModalEditMode(false);
      setImprovedContent('');
    }
  }, [activeNote]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes(user.token);
      setNotes(data);
    } catch {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteInput.trim()) {
      setError('Both title and content are required.');
      return;
    }
    setLoading(true);
    try {
      await createNote({ title: noteTitle, content: noteInput }, user.token);
      setNoteTitle('');
      setNoteInput('');
      loadNotes();
    } catch {
      setError('Failed to save note.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await deleteNote(id, user.token);
      loadNotes();
      if (activeNote && activeNote._id === id) {
        setShowModal(false);
        setActiveNote(null);
      }
    } catch {
      setError('Failed to delete note.');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (note, isFromModal = false) => {
    if (improvingNoteId) return; // Prevent multiple simultaneous improvements
    
    setImprovingNoteId(note._id);
    setError(''); // Clear any previous errors
    
    try {
      // If improving from card, show modal first then improve
      if (!isFromModal) {
        setActiveNote(note);
        setShowModal(true);
      }
      
      const response = await improveNoteService(note.content, user.token, customPrompt);
      let improved = '';
      
      if (response.improved) {
        improved = typeof response.improved === 'string' 
          ? response.improved 
          : response.improved.parts?.map(p => p.text).join('') || '';
      }
      
      if (!improved) {
        throw new Error('No improvement suggestion received');
      }
      
      setImprovedContent(improved);
      
      // If from card, we've already set these
      if (isFromModal) {
        setActiveNote(note);
        setShowModal(true);
      }
    } catch (err) {
      setError('Failed to improve note. Please try again.');
      // Don't show modal if there's an error
      if (!isFromModal) {
        setShowModal(false);
        setActiveNote(null);
      }
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
      await updateNote(activeNote._id, { title: modalTitle, content: modalContent }, user.token);
      loadNotes();
      setShowModal(false);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Create New Note
        </h1>
        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
          {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Total
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Note Input */}
      <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 border border-gray-100">
        <input
          type="text"
          placeholder="Enter note title..."
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full border-0 border-b-2 border-gray-200 p-3 mb-6 text-xl font-medium focus:outline-none focus:border-blue-500 bg-transparent placeholder-gray-400"
        />
        <textarea
          placeholder="Write your note content here..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          rows={6}
          className="w-full border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder-gray-400 text-gray-600"
        />
        <button
          onClick={handleAddNote}
          disabled={loading || !noteTitle.trim() || !noteInput.trim()}
          className={`mt-6 w-full flex justify-center items-center gap-2 rounded-xl py-4 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
            ${loading || !noteTitle.trim() || !noteInput.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <Plus size={20} /> Create Note
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="h-2 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg">Your notes will appear here</p>
          <p className="text-gray-400 text-sm">Start by creating your first note above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((note) => (
            <div
              key={note._id}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between transition-all duration-200 border border-gray-100"
              onClick={() => { setActiveNote(note); setShowModal(true); }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> {note.title}
                </h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed mb-6">{note.content}</p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNote(note);
                    setModalEditMode(true);
                    setShowModal(true);
                  }}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                  aria-label="Edit Note"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note._id);
                  }}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Delete Note"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImprove(note, false);
                  }}
                  className="text-gray-600 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors flex items-center gap-1"
                  aria-label="Improve Note"
                  disabled={improvingNoteId === note._id}
                >
                  <Wand2 size={16} className={improvingNoteId === note._id ? 'animate-spin' : ''} />
                  <span>{improvingNoteId === note._id ? 'Improving...' : 'Improve'}</span>
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
                          onClick={() => handleImprove(activeNote, true)}
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
                          onClick={() => {
                            updateNote(activeNote._id, { title: activeNote.title, content: improvedContent }, user.token);
                            loadNotes();
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
                    onClick={() => {
                      setCustomPrompt(localStorage.getItem('customAIPrompt') || 'Improve this text with better grammar and clarity:');
                      setShowPromptSettings(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const defaultPrompt = 'Improve this text with better grammar and clarity:';
                      setCustomPrompt(defaultPrompt);
                      localStorage.setItem('customAIPrompt', defaultPrompt);
                      setShowPromptSettings(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('customAIPrompt', customPrompt);
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

export default NotesPage;
