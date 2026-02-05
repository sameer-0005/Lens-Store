import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import api from '../api/axios';

const EditLens = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    boxNumber: '',
    sph: '',
    cyl: '',
    axis: '',
    addition: '',
    quantity: ''
  });

  useEffect(() => {
    fetchLens();
  }, [id]);

  const fetchLens = async () => {
    try {
      const res = await api.get(`/lens/${id}`);
      const lens = res.data;
      setFormData({
        boxNumber: lens.boxNumber || '',
        sph: lens.sph !== null ? lens.sph : '',
        cyl: lens.cyl !== null ? lens.cyl : '',
        axis: lens.axis !== null ? lens.axis : '',
        addition: lens.addition !== null ? lens.addition : '',
        quantity: lens.quantity !== null ? lens.quantity : ''
      });
    } catch (error) {
      toast.error('Failed to load lens');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);
    try {
      await api.put(`/lens/${id}`, {
        ...formData,
        quantity: parseInt(formData.quantity) || 0
      });
      toast.success('Lens updated successfully');
      navigate('/search');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lens');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/lens/${id}`);
      toast.success('Lens deleted successfully');
      navigate('/search');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lens');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader text="Loading lens..." />
      </div>
    );
  }

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
          Edit Lens
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
            className="input-field"
          />
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
            min="0"
            className="input-field"
          />
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
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Update Lens'
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 card p-6 border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Once you delete a lens, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Lens
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Lens
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Are you sure you want to delete this lens?
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm">
                <span className="text-gray-500">Box:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">{formData.boxNumber}</span>
              </p>
              {formData.sph && (
                <p className="text-sm">
                  <span className="text-gray-500">SPH:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{formData.sph}</span>
                </p>
              )}
            </div>

            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLens;
