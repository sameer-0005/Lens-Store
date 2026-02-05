import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Edit, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const LensCard = ({ lens, onQuantityChange }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(lens.quantity);

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    }
    return value;
  };

  const getQuantityColor = (qty) => {
    if (qty === 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (qty < 4) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  };

  const handleAdjustQuantity = async (adjustment) => {
    if (loading) return;
    
    const newQty = currentQuantity + adjustment;
    if (newQty < 0) {
      toast.error('Quantity cannot go below 0');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`/lens/${lens._id}/quantity`, { adjustment });
      setCurrentQuantity(res.data.lens.quantity);
      
      if (res.data.warning) {
        toast.error(res.data.warning, { icon: '⚠️' });
      } else {
        toast.success(`Quantity updated to ${res.data.lens.quantity}`);
      }
      
      if (onQuantityChange) {
        onQuantityChange(lens._id, res.data.lens.quantity);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary-600" />
          <span className="font-semibold text-lg text-gray-900 dark:text-white">
            {lens.boxNumber}
          </span>
        </div>
        <button
          onClick={() => navigate(`/lens/${lens._id}/edit`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">SPH</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatValue(lens.sph)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">CYL</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatValue(lens.cyl)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">AXIS</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {lens.axis !== null ? `${lens.axis}°` : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">ADD</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatValue(lens.addition)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getQuantityColor(currentQuantity)}`}>
          Qty: {currentQuantity}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAdjustQuantity(-2)}
            disabled={loading || currentQuantity < 2}
            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xs font-bold">-2</span>
          </button>
          <button
            onClick={() => handleAdjustQuantity(-1)}
            disabled={loading || currentQuantity < 1}
            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAdjustQuantity(1)}
            disabled={loading}
            className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAdjustQuantity(2)}
            disabled={loading}
            className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xs font-bold">+2</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LensCard;
