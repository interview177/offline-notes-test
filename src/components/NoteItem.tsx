import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import SyncIndicator from './SyncIndicator';
import { Note } from '../utils/notes';
import { Button } from '../styles/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faTrashAlt, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const NoteItemWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const NoteFrame = styled.li<{ isSubmitted?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid ${props => props.isSubmitted ? '#e5e7eb' : '#d1d5db'};
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 600px;
  min-height: 120px;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-wrap: break-word;
  word-break: break-word;
  margin-bottom: 1.5rem;
  padding-right: 2rem;
  line-height: 1.5;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  min-height: 100px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const NoteTimestamp = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
`;

const EditButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    color: #374151;
  }

  &:disabled {
    color: #d1d5db;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: #6366f1;
  color: white;

  &:hover {
    background-color: #4f46e5;
  }
`;

const CancelButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  color: #374151;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const OfflineIndicatorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const OfflineIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #ef4444;
`;

const OfflineIndicatorIcon = styled(FontAwesomeIcon)`
  margin-right: 0.25rem;
`;

interface NoteItemProps {
  note: Note;
  onDeleteNote: (noteId: string) => Promise<void>;
  onEditNote: (noteId: string, updatedTitle: string) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDeleteNote, onEditNote }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = async () => {
    setSyncing(true);
    try {
      if (note.localId) {
        await onDeleteNote(note.localId);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTitle(note.title);
  };

  const handleSave = async () => {
    if (note.localId) {
      setSyncing(true);
      try {
        await onEditNote(note.localId, title);
        setIsEditing(false);
      } catch (error) {
        console.error('Error editing note:', error);
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(note.title);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return (
    <NoteItemWrapper>
      <NoteFrame isSubmitted={!!note._id}>
        {isSyncing && <SyncIndicator />}
        
        <ActionButtons>
          <IconButton onClick={handleDelete} disabled={isSyncing}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </IconButton>
          <IconButton onClick={handleEdit} disabled={isEditing || isSyncing}>
            <FontAwesomeIcon icon={faEdit} />
          </IconButton>
        </ActionButtons>

        {isEditing ? (
          <>
            <EditTextarea
              ref={textareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <EditButtons>
              <CancelButton onClick={handleCancel}>Cancel</CancelButton>
              <SaveButton onClick={handleSave} disabled={isSyncing}>
                {isSyncing ? 'Saving...' : 'Save'}
              </SaveButton>
            </EditButtons>
          </>
        ) : (
          <>
            <Content>{note.title}</Content>
            <NoteTimestamp>
              {new Date(note.createdAt).toLocaleString()}
            </NoteTimestamp>
          </>
        )}
      </NoteFrame>

      {(!note.localDeleteSynced || !note.localEditSynced || !note._id) && (
        <OfflineIndicatorWrapper>
          {!note.localDeleteSynced && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <span>Note deletion pending sync</span>
            </OfflineIndicator>
          )}
          {!note.localEditSynced && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <span>Note edit pending sync</span>
            </OfflineIndicator>
          )}
          {!note._id && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <span>Note creation pending sync</span>
            </OfflineIndicator>
          )}
        </OfflineIndicatorWrapper>
      )}
    </NoteItemWrapper>
  );
};

export default NoteItem;