import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Package } from 'lucide-react';
import LensCard from '../components/LensCard';
import Loader from '../components/Loader';
import api from '../api/axios';

const LowStock = () => {
  const navigate = useNavigate();
  const [lenses, setLenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/lens/low-stock');
      setLenses(res.data);
    } catch (error) {
      console.error('Failed to fetch low stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 4) {
      // Remove from list if quantity is no longer low
      setLenses(lenses.filter(lens => lens._id !== id));
    } else {
      setLenses(lenses.map(lens => 
        lens._id === id ? { ...lens, quantity: newQuantity } : lens
      ).sort((a, b) => a.quantity - b.quantity));
    }
  };

  return (
    <div className="page-container px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Low Stock Items
        </h1>
      </div>

      {loading ? (
        <Loader text="Loading..." />
      ) : (
        <>
          {/* Alert Banner */}
          {lenses.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {lenses.length} item{lenses.length !== 1 ? 's' : ''} with low stock
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                    Items shown have quantity less than 4
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {lenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full inline-block mb-4">
                <Package className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                All stocked up!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No items are running low on stock
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lenses.map(lens => (
                <LensCard 
                  key={lens._id} 
                  lens={lens} 
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LowStock;
