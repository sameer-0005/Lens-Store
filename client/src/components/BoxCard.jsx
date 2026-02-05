import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';

const BoxCard = ({ boxNumber, lensCount, filters }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Pass current filters to box detail page via URL params
    const params = new URLSearchParams();
    if (filters.sph) params.append('sph', filters.sph);
    if (filters.cyl) params.append('cyl', filters.cyl);
    if (filters.axis) params.append('axis', filters.axis);
    if (filters.addition) params.append('addition', filters.addition);
    
    const queryString = params.toString();
    navigate(`/box/${encodeURIComponent(boxNumber)}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full card p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Package className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-white">
            Box {boxNumber}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lensCount} lens{lensCount !== 1 ? 'es' : ''} matching filters
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
};

export default BoxCard;
