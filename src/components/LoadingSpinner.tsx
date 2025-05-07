import styled, { keyframes } from 'styled-components';

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

interface SpinnerContainerProps {
  size?: 'small' | 'medium' | 'large';
}

const SpinnerContainer = styled.div<SpinnerContainerProps>`
  display: inline-block;
  width: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '40px' : '30px'};
  height: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '40px' : '30px'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  return <SpinnerContainer size={size} />;
};