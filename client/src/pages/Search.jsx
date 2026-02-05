import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, ChevronDown, ChevronUp, Package } from 'lucide-react';
import LensCard from '../components/LensCard';
import Loader from '../components/Loader';
import api from '../api/axios';

const Search = () => {
  const [lenses, setLenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [boxNumber, setBoxNumber] = useState('');
  const [sph, setSph] = useState('');
  const [cyl, setCyl] = useState('');
  const [axis, setAxis] = useState('');
  const [addition, setAddition] = useState('');

  useEffect(() => {
    fetchLenses();
  }, []);

  const fetchLenses = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.boxNumber) params.append('boxNumber', filters.boxNumber);
      if (filters.sph) params.append('sph', filters.sph);
      if (filters.cyl) params.append('cyl', filters.cyl);
      if (filters.axis) params.append('axis', filters.axis);
      if (filters.addition) params.append('addition', filters.addition);
      
      const res = await api.get(`/lens?${params.toString()}`);
      setLenses(res.data);
    } catch (error) {
      console.error('Failed to fetch lenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLenses({ boxNumber, sph, cyl, axis, addition });
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    fetchLenses({ boxNumber });
  };

  const clearFilters = () => {
    setBoxNumber('');
    setSph('');
    setCyl('');
    setAxis('');
    setAddition('');
    fetchLenses();
  };

  const handleQuantityChange = (id, newQuantity) => {
    setLenses(lenses.map(lens => 
      lens._id === id ? { ...lens, quantity: newQuantity } : lens
    ));
  };

  return (
    <div className="page-container px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Search Lenses
      </h1>

      {/* Quick Search */}
      <form onSubmit={handleQuickSearch} className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={boxNumber}
            onChange={(e) => setBoxNumber(e.target.value)}
            placeholder="Search by box number..."
            className="input-field pl-10 pr-20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-3 text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium mb-4"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Advanced Filters */}
      {showFilters && (
        <form onSubmit={handleSearch} className="card p-4 mb-6">
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
        <Loader text="Searching..." />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {lenses.length} result{lenses.length !== 1 ? 's' : ''} found
          </p>
          
          {lenses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No lenses found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your search filters
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

export default Search;
