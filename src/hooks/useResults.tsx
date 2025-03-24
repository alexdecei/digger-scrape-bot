
import { Result } from '../types';

export const useResults = (results: Result[]) => {
  // This hook is now simpler since we removed the search functionality
  // We just return the results directly
  return {
    results,
  };
};
