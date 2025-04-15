// src/pages/movement-patterns/sections/RelatedPatternsSection.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import movementPatternService, {
  MovementPattern,
} from '../../../api/movementPatternService';
import CategoryBadge from '../../../components/movement-patterns/CategoryBadge';
import TypeBadge from '../../../components/movement-patterns/TypeBadge';
import EmptyState from '../../../components/ui/empty-state';

interface RelatedPatternsSectionProps {
  patternId: string;
}

const RelatedPatternsSection: React.FC<RelatedPatternsSectionProps> = ({
  patternId,
}) => {
  const { showToast } = useToast();
  const [relatedPatterns, setRelatedPatterns] = useState<MovementPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPatterns = async () => {
      setIsLoading(true);
      try {
        const patterns =
          await movementPatternService.getRelatedPatterns(patternId);
        setRelatedPatterns(patterns);
      } catch (error) {
        console.error('Error fetching related patterns:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load related patterns',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedPatterns();
  }, [patternId, showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (relatedPatterns.length === 0) {
    return (
      <EmptyState
        icon={<LinkIcon className="h-12 w-12 text-gray-400" />}
        title="No related patterns found"
        description="This movement pattern doesn't have any related patterns defined."
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Related Movement Patterns
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedPatterns.map((pattern) => (
          <Link
            key={pattern.id}
            to={`/movement-patterns/${pattern.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  {pattern.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <TypeBadge type={pattern.patternType} />
                  <CategoryBadge category={pattern.category} />
                </div>
                {pattern.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {pattern.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPatternsSection;
