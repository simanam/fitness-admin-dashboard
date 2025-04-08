// src/hooks/useMovementPatternDetail.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import movementPatternService, {
  MovementPattern,
} from '../api/movementPatternService';

interface UseMovementPatternDetailParams {
  patternId: string;
}

export const useMovementPatternDetail = ({
  patternId,
}: UseMovementPatternDetailParams) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pattern, setPattern] = useState<MovementPattern | null>(null);
  const [patternSummary, setPatternSummary] = useState<any>(null);
  const [relatedPatterns, setRelatedPatterns] = useState<MovementPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch pattern data and related information
  const fetchPattern = async () => {
    if (!patternId) return;

    setIsLoading(true);
    try {
      const [patternData, summaryData, relatedData] = await Promise.all([
        movementPatternService.getMovementPattern(patternId),
        movementPatternService.getPatternSummary(patternId),
        movementPatternService.getRelatedPatterns(patternId),
      ]);

      setPattern(patternData);
      setPatternSummary(summaryData);
      setRelatedPatterns(relatedData);
    } catch (error) {
      console.error('Error fetching movement pattern data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load movement pattern details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPattern();
  }, [patternId]);

  // Delete movement pattern
  const deletePattern = async () => {
    if (!patternId) return;

    setIsDeleting(true);
    try {
      await movementPatternService.deleteMovementPattern(patternId);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Movement pattern deleted successfully',
      });
      navigate('/movement-patterns');
      return true;
    } catch (error) {
      console.error('Error deleting movement pattern:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete movement pattern',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    pattern,
    patternSummary,
    relatedPatterns,
    isLoading,
    isDeleting,
    fetchPattern,
    deletePattern,
  };
};

export default useMovementPatternDetail;
