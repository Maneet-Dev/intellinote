import React, { useEffect, useState } from 'react';
import { getNotes, createNote, deleteNote, updateNote, improveNote as improveNoteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import { Plus, Save, Trash2, Edit, X, Wand2, FileText, Check, Copy } from 'lucide-react';

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

  const handleImprove = async (note) => {
    setImprovingNoteId(note._id);
    try {
      const response = await improveNoteService(note.content, user.token);
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
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">📝 IntelliNote</h1>

      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

      {/* Create Note Input */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <input
          type="text"
          placeholder="Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full border rounded p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Write your note..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          rows={4}
          className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddNote}
          disabled={loading || !noteTitle.trim() || !noteInput.trim()}
          className={`mt-4 w-full flex justify-center items-center gap-2 rounded py-3 text-white transition
            ${loading || !noteTitle.trim() || !noteInput.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <Plus size={20} /> Add Note
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-center text-gray-500">No notes yet. Start by adding one above!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg cursor-pointer flex flex-col justify-between transition"
              onClick={() => { setActiveNote(note); setShowModal(true); }}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText size={20} /> {note.title}
              </h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">{note.content}</p>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNote(note);
                    setModalEditMode(true);
                    setShowModal(true);
                  }}
                  className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                  aria-label="Edit Note"
                >
                  <Edit size={18} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note._id);
                  }}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  aria-label="Delete Note"
                >
                  <Trash2 size={18} /> Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImprove(note);
                  }}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1"
                  aria-label="Improve Note"
                  disabled={improvingNoteId === note._id}
                >
                  <Wand2 size={18} /> {improvingNoteId === note._id ? 'Improving...' : 'Improve'}
                </button>
              </div>
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
                    >
                      <Wand2 size={18} /> Improve
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          updateNote(activeNote._id, { title: activeNote.title, content: improvedContent }, user.token);
                          loadNotes();
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

export default NotesPage;
