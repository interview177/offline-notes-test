import React, { useState, ChangeEvent } from 'react';
import styled, { keyframes } from 'styled-components';
import { LoadingSpinner } from './LoadingSpinner';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

// Styled components
const NoteFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.3s ease-out;
  transition: all 0.2s ease;

  &:focus-within {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  font-size: 1.2rem;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
`;

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  resize: none;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const CharacterCounter = styled.div<{ $isLimitExceeded: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isLimitExceeded ? '#ef4444' : '#6b7280'};
  text-align: right;
  margin-top: -0.5rem;
`;

const AddNoteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${pulse} 2s infinite;

  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    animation: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
  }
`;

interface NoteFormProps {
  onNoteSubmit: (noteTitle: string) => Promise<void>;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteSubmit }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const MAX_CHARACTERS = 500;

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= MAX_CHARACTERS) {
      setNoteTitle(event.target.value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteTitle.trim() === '' || isSyncing) {
      return;
    }
    
    setSyncing(true);
    try {
      await onNoteSubmit(noteTitle);
      setNoteTitle('');
    } finally {
      setSyncing(false);
    }
  };

  const charactersRemaining = MAX_CHARACTERS - noteTitle.length;
  const isLimitExceeded = charactersRemaining < 0;

  return (
    <NoteFormContainer onSubmit={handleSubmit}>
      <FormHeader>
        <FormIcon>✏️</FormIcon>
        <FormTitle>Add a New Note</FormTitle>
      </FormHeader>
      
      <NoteInput
        rows={5}
        value={noteTitle}
        onChange={handleNoteTitleChange}
        placeholder="What's on your mind? Start typing your note here..."
      />
      
      <CharacterCounter $isLimitExceeded={isLimitExceeded}>
        {charactersRemaining} characters remaining
      </CharacterCounter>
      
      <AddNoteButton 
        type="submit" 
        disabled={noteTitle.trim() === '' || isSyncing || isLimitExceeded}
      >
        {isSyncing ? (
          <>
            <LoadingSpinner size="small" />
            Adding...
          </>
        ) : (
          'Add Note'
        )}
      </AddNoteButton>
    </NoteFormContainer>
  );
};

export default NoteForm;