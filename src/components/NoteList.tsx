import { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Container, Heading } from '../styles/styled';
import { LoadingSpinner } from './LoadingSpinner';
import { Note, createNote, submitNote, deleteNote, editNote, refreshNotes, getNotes } from '../utils/notes';
import NoteForm from './NoteForm';
import NoteItem from './NoteItem';
import OfflineIndicator from './OfflineIndicator';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const NotesContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  max-width: 800px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const NoteListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
`;

const NoteListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const NotesCount = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

const NoteListContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  text-align: center;
  color: #6b7280;
`;

const EmptyStateIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #d1d5db;
`;

const NoteListLoadingSpinner = styled(LoadingSpinner).attrs({ size: 'medium' })`
  margin: 2rem auto;
`;

export default function NoteList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNoteSubmit = useCallback(async (noteTitle: string) => {
    setIsSubmitting(true);
    try {
      const note: Note = createNote(noteTitle);
      await submitNote(note);
      setAllNotes(await getNotes());
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setAllNotes(await getNotes());
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  const handleEditNote = useCallback(async (noteId: string, updatedTitle: string) => {
    try {
      await editNote(noteId, updatedTitle);
      setAllNotes(await getNotes());
    } catch (error) {
      console.error('Error editing note:', error);
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      await refreshNotes();
      const notes = await getNotes();
      setAllNotes(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
  
          window.addEventListener('online', async () => {
            registration.sync.register('sync-notes')
              .then(() => {
                console.log('Sync event registered');
              })
              .catch((error) => {
                console.error('Sync event registration failed:', error);
              });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    const handleOnline = async () => {
      await fetchNotes();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchNotes]);

  return (
    <NotesContainer>
      <NoteListWrapper>
        <NoteListHeader>
          <Heading>My Notes</Heading>
          <NotesCount>{allNotes.length} {allNotes.length === 1 ? 'note' : 'notes'}</NotesCount>
        </NoteListHeader>

        <NoteForm onNoteSubmit={handleNoteSubmit} />

        <NoteListContent>
          {loading ? (
            <NoteListLoadingSpinner />
          ) : allNotes.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>📝</EmptyStateIcon>
              <h3>No notes yet</h3>
              <p>Add your first note by typing above</p>
            </EmptyState>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
              {allNotes.map((note, index) => (
                <NoteItem 
                  key={index} 
                  note={note} 
                  onDeleteNote={handleNoteDelete} 
                  onEditNote={handleEditNote} 
                />
              ))}
            </ul>
          )}
        </NoteListContent>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}