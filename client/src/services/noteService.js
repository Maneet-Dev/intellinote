import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

// Get all notes
export const getNotes = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Create a new note
export const createNote = async (noteData, token) => {
  const res = await axios.post(API_URL, noteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Update a note
export const updateNote = async (id, noteData, token) => {
  const res = await axios.put(`${API_URL}/${id}`, noteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Delete a note
export const deleteNote = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Improve note using Gemini AI
export const improveNote = async (content, token, customPrompt = null) => {
  const res = await axios.post(`${API_URL}/improve`, 
    { content, customPrompt },
    {
      headers: { Authorization: `Bearer ${token}` }
    });

  return res.data; // full response { improved: ... }
};

