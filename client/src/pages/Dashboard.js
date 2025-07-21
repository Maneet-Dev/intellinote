import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getNotes, deleteNote, updateNote, improveNote } from '../services/noteService';
import { FileText, Edit, Trash2, Wand2, X, Save, Check, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [improvingNoteId, setImprovingNoteId] = useState(null);
  const [improvedContent, setImprovedContent] = useState('');

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
      const response = await improveNote(note.content, token);
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
    <div className="max-w-5xl mx-auto mt-10 px-4">
      {/* Welcome Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8 border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-600 text-lg">Your personal smart notebook powered by AI.</p>
          <p className="mt-1 text-blue-600 font-semibold">Total Notes: {notes.length}</p>
        </div>

        <button
          onClick={() => navigate('/notes')} // Navigate to notes page to add new note
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg cursor-pointer flex flex-col"
              onClick={() => { setActiveNote(note); setShowModal(true); }}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText size={20} /> {note.title}
              </h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && activeNote && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
            {modalEditMode ? (
              <>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full border rounded p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  rows={6}
                  className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleModalSave}
                    disabled={loading || !modalTitle.trim() || !modalContent.trim()}
                    className={`flex items-center gap-2 rounded px-4 py-2 text-white transition
                      ${loading || !modalTitle.trim() || !modalContent.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    onClick={() => setModalEditMode(false)}
                    disabled={loading}
                    className="bg-gray-400 text-white rounded px-4 py-2 hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-3">{modalTitle}</h2>
                <p className="mb-6 whitespace-pre-wrap text-gray-700">{modalContent}</p>

                {improvedContent && (
                  <div className="bg-gray-100 p-3 rounded mb-5">
                    <h4 className="font-semibold mb-2">Suggested Improvement</h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-800">{improvedContent}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setModalEditMode(true)}
                    className="text-yellow-600 border border-yellow-600 px-3 py-1 rounded hover:bg-yellow-100 flex items-center gap-1"
                  >
                    <Edit size={18} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(activeNote._id)}
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100 flex items-center gap-1"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                  {!improvedContent ? (
                    <button
                      onClick={() => handleImprove(activeNote)}
                      className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-100 flex items-center gap-1"
                      disabled={improvingNoteId === activeNote._id}
                    >
                      <Wand2 size={18} /> {improvingNoteId === activeNote._id ? 'Improving...' : 'Improve'}
                    </button>
                  ) : (
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <Check size={18} /> Replace
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(improvedContent)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
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
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100 flex items-center gap-1"
                  >
                    <X size={18} /> Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
