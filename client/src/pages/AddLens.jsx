import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AddLens = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    boxNumber: '',
    sph: '',
    cyl: '',
    axis: '',
    addition: '',
    quantity: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.boxNumber) {
      toast.error('Box number is required');
      return;
    }
    
    if (formData.quantity === '' || formData.quantity < 0) {
      toast.error('Valid quantity is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/lens', {
        ...formData,
        quantity: parseInt(formData.quantity)
      });

      if (res.data.updated) {
        toast.success(res.data.message || 'Quantity added to existing lens');
      } else {
        toast.success('New lens added successfully');
      }

      // Clear all fields except boxNumber to allow quick entry of multiple lenses
      setFormData(prev => ({
        boxNumber: prev.boxNumber,  // Keep box number
        sph: '',
        cyl: '',
        axis: '',
        addition: '',
        quantity: ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lens');
    } finally {
      setLoading(false);
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
          Add New Lens
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Box Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="boxNumber"
            value={formData.boxNumber}
            onChange={handleChange}
            placeholder="e.g., A1, Shelf 2"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Location identifier for the lens</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SPH
            </label>
            <input
              type="number"
              step="0.25"
              name="sph"
              value={formData.sph}
              onChange={handleChange}
              placeholder="-20 to +20"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Spherical power</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CYL
            </label>
            <input
              type="number"
              step="0.25"
              name="cyl"
              value={formData.cyl}
              onChange={handleChange}
              placeholder="-6 to +6"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Cylindrical power</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Axis
            </label>
            <input
              type="number"
              name="axis"
              value={formData.axis}
              onChange={handleChange}
              placeholder="0 to 180"
              min="0"
              max="180"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Axis degree (0-180)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Addition
            </label>
            <input
              type="number"
              step="0.25"
              name="addition"
              value={formData.addition}
              onChange={handleChange}
              placeholder="+0.75 to +4"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Addition power</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Number of items in stock</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Lens'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLens;
