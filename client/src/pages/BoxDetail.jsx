import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import LensCard from '../components/LensCard';
import Loader from '../components/Loader';
import api from '../api/axios';

const BoxDetail = () => {
  const { boxNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [lenses, setLenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters from URL params (passed from search page)
  const [sph, setSph] = useState(searchParams.get('sph') || '');
  const [cyl, setCyl] = useState(searchParams.get('cyl') || '');
  const [axis, setAxis] = useState(searchParams.get('axis') || '');
  const [addition, setAddition] = useState(searchParams.get('addition') || '');

  useEffect(() => {
    fetchLenses();
  }, [boxNumber]);

  const fetchLenses = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('boxNumber', decodeURIComponent(boxNumber));
      
      // Use passed filters or current state
      const currentSph = filters.sph !== undefined ? filters.sph : sph;
      const currentCyl = filters.cyl !== undefined ? filters.cyl : cyl;
      const currentAxis = filters.axis !== undefined ? filters.axis : axis;
      const currentAddition = filters.addition !== undefined ? filters.addition : addition;
      
      if (currentSph) params.append('sph', currentSph);
      if (currentCyl) params.append('cyl', currentCyl);
      if (currentAxis) params.append('axis', currentAxis);
      if (currentAddition) params.append('addition', currentAddition);
      
      const res = await api.get(`/lens?${params.toString()}`);
      setLenses(res.data);
    } catch (error) {
      console.error('Failed to fetch lenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLenses({ sph, cyl, axis, addition });
  };

  const clearFilters = () => {
    setSph('');
    setCyl('');
    setAxis('');
    setAddition('');
    fetchLenses({ sph: '', cyl: '', axis: '', addition: '' });
  };

  const handleQuantityChange = (id, newQuantity) => {
    setLenses(lenses.map(lens => 
      lens._id === id ? { ...lens, quantity: newQuantity } : lens
    ));
  };

  // Calculate total quantity in this box
  const totalQuantity = lenses.reduce((sum, lens) => sum + lens.quantity, 0);

  return (
    <div className="page-container px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Package className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Box {decodeURIComponent(boxNumber)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lenses.length} lens type{lenses.length !== 1 ? 's' : ''} • {totalQuantity} total items
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium my-4"
      >
        <Filter className="h-4 w-4" />
        Filter within this box
        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Advanced Filters - NO box number field */}
      {showFilters && (
        <form onSubmit={handleFilter} className="card p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SPH
              </label>
              <input
                type="number"
                step="0.25"
                value={sph}
                onChange={(e) => setSph(e.target.value)}
                placeholder="-20 to +20"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CYL
              </label>
              <input
                type="number"
                step="0.25"
                value={cyl}
                onChange={(e) => setCyl(e.target.value)}
                placeholder="-6 to +6"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Axis
              </label>
              <input
                type="number"
                value={axis}
                onChange={(e) => setAxis(e.target.value)}
                placeholder="0 to 180"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Addition
              </label>
              <input
                type="number"
                step="0.25"
                value={addition}
                onChange={(e) => setAddition(e.target.value)}
                placeholder="+0.75 to +4"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="flex-1 btn-primary">
              Apply Filters
            </button>
            <button type="button" onClick={clearFilters} className="flex-1 btn-secondary">
              Clear
            </button>
          </div>
        </form>
      )}

      {/* Results */}
      {loading ? (
        <Loader text="Loading lenses..." />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing {lenses.length} lens type{lenses.length !== 1 ? 's' : ''}
          </p>
          
          {lenses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No lenses found in this box</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lenses.map(lens => (
                <LensCard 
                  key={lens._id} 
                  lens={lens} 
                  onQuantityChange={handleQuantityChange}
                  hideBoxNumber={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoxDetail;
