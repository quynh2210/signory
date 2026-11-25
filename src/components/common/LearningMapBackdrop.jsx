import React from 'react';
import AtmosphericBackdrop from './AtmosphericBackdrop';

/**
 * Ambient animated decorative layer placed strictly behind learning map content.
 */
export const LearningMapBackdrop = ({ variant = 'parents' }) => {
  return <AtmosphericBackdrop variant={variant} />;
};

export default LearningMapBackdrop;
