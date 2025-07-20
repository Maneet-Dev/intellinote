import React, { useEffect, useState } from 'react';
import { getNotes, createNote, deleteNote, updateNote, improveNote as improveNoteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';

function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [improvingNoteId, setImprovingNoteId] = useState(null);
  const [improvedContent, setImprovedContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null); // Note opened in modal

  // New state for modal editing
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  // Load notes on user change
  useEffect(() => {
    if (user?.token) {
      loadNotes();
    }
  }, [user]);

  // Sync modal inputs when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setModalTitle(activeNote.title);
      setModalContent(activeNote.content);
      setModalEditMode(false); // reset modal to view mode on open
      setImprovedContent('');
    }
  }, [activeNote]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes(user.token);
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    setError('');
    if (!noteTitle.trim() || !noteInput.trim()) {
      setError('Both title and content are required.');
      return;
    }
    setLoading(true);
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, { title: noteTitle, content: noteInput }, user.token);
        setEditingNoteId(null);
      } else {
        await createNote({ title: noteTitle, content: noteInput }, user.token);
      }
      setNoteTitle('');
      setNoteInput('');
      loadNotes();
    } catch {
      setError('Failed to save note.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note, inline = false) => {
    if (inline) {
      setEditingNoteId(note._id);
      // Remove these two lines to avoid affecting the create form:
      // setNoteTitle(note.title);
      // setNoteInput(note.content);
    } else {
      setActiveNote(note);
      setModalEditMode(true);
      setModalTitle(note.title);
      setModalContent(note.content);
      setShowModal(true);
    }
  };



  const handleCancelEdit = () => {
    setNoteTitle('');
    setNoteInput('');
    setEditingNoteId(null);
    setError('');
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    setLoading(true);
    setError('');
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
    setError('');
    setImprovingNoteId(note._id);
    try {
      const response = await improveNoteService(note.content, user.token);
      const improved = response.improved?.parts?.map(p => p.text).join('') || response.improved || '';

      setImprovedContent(improved);
      setActiveNote(note);
      setShowModal(true);
    } catch (err) {
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
    setError('');
    try {
      await updateNote(activeNote._id, { title: modalTitle, content: modalContent }, user.token);
      loadNotes();
      setShowModal(false);
      setActiveNote(null);
      setModalEditMode(false);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    // Reset modal inputs to activeNote content
    if (activeNote) {
      setModalTitle(activeNote.title);
      setModalContent(activeNote.content);
    }
    setModalEditMode(false);
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📝 Your Notes</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Title"
          className="w-full border rounded p-2 mb-2"
          disabled={loading}
        />
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Write your note..."
          className="w-full border rounded p-2"
          rows={4}
          disabled={loading}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleAddNote}
            disabled={loading || !noteTitle.trim() || !noteInput.trim()}
            className={`px-4 py-2 rounded text-white ${loading || !noteTitle.trim() || !noteInput.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            Add
          </button>
          {editingNoteId && (
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-4 py-2 rounded border border-red-600 text-red-600 hover:bg-red-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {loading && !editingNoteId ? (
        <p>Loading notes...</p>
      ) : (
        <ul>
          {notes.length === 0 && <p>No notes found. Start by adding one above!</p>}
          {notes.map((note) => {
            const isEditing = editingNoteId === note._id;

            return (
              <li
                key={note._id}
                className="border p-4 rounded mb-4 shadow hover:shadow-lg transition flex flex-col"
                onClick={() => {
                  if (!isEditing) {
                    setActiveNote(note);
                    setShowModal(true);
                    setImprovedContent('');
                  }
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      className="border rounded p-1 mb-2"
                      value={note.editTitle || note.title}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n =>
                          n._id === note._id ? { ...n, editTitle: e.target.value } : n
                        );
                        setNotes(updatedNotes);
                      }}
                    />
                    <textarea
                      className="border rounded p-1 mb-2"
                      rows={4}
                      value={note.editContent || note.content}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n =>
                          n._id === note._id ? { ...n, editContent: e.target.value } : n
                        );
                        setNotes(updatedNotes);
                      }}
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={async () => {
                          const updatedTitle = note.editTitle !== undefined ? note.editTitle : note.title;
                          const updatedContent = note.editContent !== undefined ? note.editContent : note.content;
                          if (!updatedTitle.trim() || !updatedContent.trim()) {
                            setError('Both title and content are required.');
                            return;
                          }
                          setLoading(true);
                          setError('');
                          try {
                            await updateNote(note._id, { title: updatedTitle, content: updatedContent }, user.token);
                            setEditingNoteId(null);
                            setNotes(notes.map(n => n._id === note._id ? { ...n, editTitle: '', editContent: '' } : n));
                            loadNotes();
                          } catch {
                            setError('Failed to update note.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !(note.editTitle?.trim() ?? note.title.trim()) || !(note.editContent?.trim() ?? note.content.trim())}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNotes(notes.map(n => n._id === note._id ? { ...n, editTitle: '', editContent: '' } : n));
                        }}

                        disabled={loading}
                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
                    <p className="mb-3 whitespace-pre-wrap line-clamp-3 overflow-hidden">{note.content}</p>
                    <div className="flex gap-4 self-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note, true); // editing inline
                        }}
                        className="text-yellow-600 hover:underline"
                      >
                        Edit
                      </button>


                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note._id);
                        }}
                        className="text-red-600 hover:underline"
                        disabled={loading || improvingNoteId === note._id}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleImprove(note)}
                        className="text-green-600 hover:underline"
                        disabled={improvingNoteId === note._id || loading}
                      >
                        {improvingNoteId === note._id ? 'Improving...' : 'Improve'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}

        </ul>
      )}

      {/* Modal */}
      {showModal && activeNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full shadow-xl">
            {modalEditMode ? (
              <>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full border rounded p-2 mb-2"
                />
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full border rounded p-2 mb-4"
                  rows={6}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleModalSave}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={loading || !modalTitle.trim() || !modalContent.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleModalCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">{modalTitle}</h2>
                <p className="whitespace-pre-wrap mb-4">{modalContent}</p>

                {improvedContent && (
                  <div className="bg-gray-100 p-3 rounded mb-4">
                    <h4 className="font-semibold mb-2">Suggested Improvement</h4>
                    <p className="whitespace-pre-wrap">{improvedContent}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setModalEditMode(true);
                    }}

                    className="text-yellow-600 border border-yellow-600 px-3 py-1 rounded hover:bg-yellow-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      handleDelete(activeNote._id);
                      setShowModal(false);
                      setActiveNote(null);
                    }}
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                  {!improvedContent ? (
                    <button
                      onClick={() => handleImprove(activeNote)}
                      className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-100"
                      disabled={improvingNoteId === activeNote._id}
                    >
                      {improvingNoteId === activeNote._id ? 'Improving...' : 'Improve'}
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Replace Note
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(improvedContent)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setImprovedContent('');
                      setActiveNote(null);
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Close
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
