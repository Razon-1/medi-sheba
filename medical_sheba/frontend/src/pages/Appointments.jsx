import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  MapPin,
  Pill,
  RefreshCw,
  Stethoscope,
  Trash2,
  Truck,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { appointmentsAPI } from '../api/appointments';
import { ambulanceAPI } from '../api/ambulance';
import { edoctorAPI } from '../api/edoctor';
import { emedicineAPI } from '../api/emedicine';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';

const serviceFilters = [
  { value: 'all', label: 'All Services', ctaLabel: 'Find Doctors', ctaPath: '/doctors' },
  { value: 'doctor', label: 'Doctor', ctaLabel: 'Find Doctors', ctaPath: '/doctors' },
  { value: 'edoctor', label: 'E-Doctor', ctaLabel: 'Find E-Doctors', ctaPath: '/edoctor' },
  { value: 'ambulance', label: 'Ambulance', ctaLabel: 'Request Ambulance', ctaPath: '/ambulance' },
  { value: 'medicine', label: 'E-Medicine', ctaLabel: 'Order Medicine', ctaPath: '/emedicine' },
];

const serviceMeta = {
  doctor: {
    label: 'Doctor Appointment',
    icon: Stethoscope,
    accent: 'text-blue-700 bg-blue-50 border-blue-100',
  },
  edoctor: {
    label: 'E-Doctor Consultation',
    icon: Video,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-100',
  },
  ambulance: {
    label: 'Ambulance Service',
    icon: Truck,
    accent: 'text-red-700 bg-red-50 border-red-100',
  },
  medicine: {
    label: 'E-Medicine Order',
    icon: Pill,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  },
};

const statusStyles = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  scheduled: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-sky-200 bg-sky-50 text-sky-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  processing: 'border-purple-200 bg-purple-50 text-purple-700',
  shipped: 'border-blue-200 bg-blue-50 text-blue-700',
  on_the_way: 'border-blue-200 bg-blue-50 text-blue-700',
  arrived: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  ongoing: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  completed: 'border-slate-200 bg-slate-100 text-slate-700',
  delivered: 'border-slate-200 bg-slate-100 text-slate-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  no_show: 'border-slate-200 bg-slate-100 text-slate-700',
};

const cancelableStatuses = {
  doctor: ['pending', 'confirmed'],
  edoctor: ['scheduled', 'confirmed'],
  ambulance: ['pending', 'accepted'],
  medicine: ['pending', 'confirmed', 'processing'],
};

const completedStatuses = ['completed', 'delivered'];
const activeStatuses = ['pending', 'scheduled', 'confirmed', 'accepted', 'processing', 'shipped', 'on_the_way', 'arrived', 'ongoing'];

const getArrayData = (response) => {
  const data = response?.data ?? response;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return String(status)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'To be confirmed';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'To be confirmed';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (timeValue) => {
  if (!timeValue) return 'To be confirmed';
  return String(timeValue).slice(0, 5);
};

const getMedicineSummary = (medicines) => {
  if (!medicines) return 'Medicine order';
  const list = Array.isArray(medicines) ? medicines : Object.values(medicines);
  if (!list.length) return 'Medicine order';
  return list
    .slice(0, 2)
    .map((item) => item.name || item.medicine_name || String(item))
    .join(', ');
};

const canViewPatientServices = (user) => {
  const roles = user?.roles || [];
  return roles.includes('patient')
    && !roles.some((role) => ['pharmacy_admin', 'hospital_admin', 'doctor', 'admin'].includes(role));
};

export default function Appointments() {
  useSEO(pageMetadata.appointments);

  const { user } = useAuthStore();
  const isPatientUser = canViewPatientServices(user);
  const [services, setServices] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isPatientUser) {
      fetchServices();
    }
  }, [isPatientUser]);

  const canCancel = (item) => {
    return cancelableStatuses[item.kind]?.includes(item.status);
  };

  const normalizeDoctorAppointment = (appointment) => ({
    id: `doctor-${appointment.id}`,
    rawId: appointment.id,
    kind: 'doctor',
    title: appointment.doctor_name || appointment.doctor?.user_name || 'Doctor Appointment',
    subtitle: appointment.doctor?.specialty || 'In-person doctor visit',
    provider: appointment.hospital?.name || 'Hospital to be confirmed',
    reference: appointment.appointment_no || `APT-${appointment.id}`,
    status: appointment.status,
    date: appointment.appointment_date,
    time: appointment.appointment_time,
    amount: appointment.fee_amount,
    paymentStatus: appointment.payment_status,
    notes: appointment.notes,
    detail: String(appointment.type || 'new').replace('_', ' '),
    createdAt: appointment.created_at,
    cancelMessage: 'Doctor appointments can be cancelled while pending or confirmed.',
    cancel: (reason) => appointmentsAPI.cancel(appointment.id, reason),
  });

  const normalizeEdoctorConsultation = (consultation) => ({
    id: `edoctor-${consultation.id}`,
    rawId: consultation.id,
    kind: 'edoctor',
    title: consultation.doctor_name || consultation.doctor?.name || 'E-Doctor Consultation',
    subtitle: consultation.specialization ? formatStatus(consultation.specialization) : 'Online doctor consultation',
    provider: 'Video consultation',
    reference: consultation.consultation_id || `ED-${consultation.id}`,
    status: consultation.status,
    date: consultation.scheduled_date,
    time: consultation.scheduled_time,
    amount: consultation.fee_amount,
    paymentStatus: consultation.payment_status || (consultation.is_paid ? 'paid' : 'unpaid'),
    notes: consultation.chief_complaint,
    detail: formatStatus(consultation.urgency || 'routine'),
    createdAt: consultation.created_at,
    cancelMessage: 'E-Doctor consultations can be cancelled before the session starts.',
    cancel: () => edoctorAPI.cancelConsultation(consultation.id),
  });

  const normalizeAmbulanceRequest = (request) => ({
    id: `ambulance-${request.id}`,
    rawId: request.id,
    kind: 'ambulance',
    title: request.ambulance_name || `${formatStatus(request.vehicle_type_required)} Ambulance`,
    subtitle: `${request.pickup_location || 'Pickup'} to ${request.dropoff_location || 'destination'}`,
    provider: request.ambulance_phone ? `Contact: ${request.ambulance_phone}` : 'Ambulance assignment pending',
    reference: request.request_id || `AMB-${request.id}`,
    status: request.status,
    date: request.required_date,
    time: null,
    amount: request.final_fare || request.estimated_fare,
    paymentStatus: request.payment_status,
    notes: request.urgency ? `${formatStatus(request.urgency)} priority` : '',
    detail: formatStatus(request.vehicle_type_required || 'ambulance'),
    createdAt: request.created_at,
    cancelMessage: 'Ambulance requests can be cancelled before the vehicle is on the way.',
    cancel: () => ambulanceAPI.cancelRequest(request.id),
  });

  const normalizeMedicineOrder = (order) => ({
    id: `medicine-${order.id}`,
    rawId: order.id,
    kind: 'medicine',
    title: order.pharmacy_name || 'Medicine Order',
    subtitle: getMedicineSummary(order.medicines_list),
    provider: order.delivery_address || 'Delivery address saved',
    reference: order.order_id || `EM-${order.id}`,
    status: order.status,
    date: order.required_date || order.created_at,
    time: null,
    amount: order.total_amount,
    paymentStatus: order.payment_status,
    notes: order.notes,
    detail: formatStatus(order.urgency || 'normal'),
    createdAt: order.created_at,
    cancelMessage: 'Medicine orders can be cancelled before delivery is handed to courier.',
    cancel: () => emedicineAPI.cancelOrder(order.id),
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        appointmentsAPI.list(),
        edoctorAPI.listConsultations(),
        ambulanceAPI.listRequests(),
        emedicineAPI.listOrders(),
      ]);

      const [appointmentsResult, edoctorResult, ambulanceResult, medicineResult] = results;
      const nextServices = [];

      if (appointmentsResult.status === 'fulfilled') {
        nextServices.push(...getArrayData(appointmentsResult.value).map(normalizeDoctorAppointment));
      }
      if (edoctorResult.status === 'fulfilled') {
        nextServices.push(...getArrayData(edoctorResult.value).map(normalizeEdoctorConsultation));
      }
      if (ambulanceResult.status === 'fulfilled') {
        nextServices.push(...getArrayData(ambulanceResult.value).map(normalizeAmbulanceRequest));
      }
      if (medicineResult.status === 'fulfilled') {
        nextServices.push(...getArrayData(medicineResult.value).map(normalizeMedicineOrder));
      }

      const failedCount = results.filter((result) => result.status === 'rejected').length;
      if (failedCount === results.length) {
        setError('Failed to load your services. Please try again.');
      } else if (failedCount > 0) {
        setError('Some services could not be loaded. Refresh to try again.');
      }

      nextServices.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setServices(nextServices);
    } catch (err) {
      console.error('Error fetching patient services:', err);
      setError('Failed to load your services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    if (activeFilter === 'all') return services;
    return services.filter((service) => service.kind === activeFilter);
  }, [services, activeFilter]);

  const stats = useMemo(() => {
    return services.reduce(
      (summary, item) => {
        summary.total += 1;
        if (activeStatuses.includes(item.status)) summary.active += 1;
        if (completedStatuses.includes(item.status)) summary.completed += 1;
        if (canCancel(item)) summary.cancelable += 1;
        return summary;
      },
      { total: 0, active: 0, completed: 0, cancelable: 0 }
    );
  }, [services]);

  const serviceCounts = useMemo(() => {
    return services.reduce(
      (counts, service) => ({
        ...counts,
        all: counts.all + 1,
        [service.kind]: (counts[service.kind] || 0) + 1,
      }),
      { all: 0, doctor: 0, edoctor: 0, ambulance: 0, medicine: 0 }
    );
  }, [services]);

  const openCancelModal = (service) => {
    setCancelTarget(service);
    setCancelReason('');
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelReason('');
  };

  const handleCancelService = async () => {
    if (!cancelTarget || !canCancel(cancelTarget)) return;

    try {
      setCancelling(true);
      await cancelTarget.cancel(cancelReason.trim());
      closeCancelModal();
      await fetchServices();
    } catch (err) {
      console.error('Cancel service error:', err);
      const message = err.response?.data?.detail || err.response?.data?.error || 'Unable to cancel this service right now.';
      setError(message);
    } finally {
      setCancelling(false);
    }
  };

  const renderEmptyState = () => {
    const selectedFilter = serviceFilters.find((filter) => filter.value === activeFilter) || serviceFilters[0];
    const selectedMeta = serviceMeta[activeFilter];
    const EmptyIcon = selectedMeta?.icon || ClipboardList;
    const title = activeFilter === 'all'
      ? 'No patient services found'
      : `No ${selectedFilter.label} services found`;
    const description = activeFilter === 'all'
      ? 'Book a doctor, request an E-Doctor consultation, order medicine, or request ambulance support to see everything here.'
      : `You do not have any ${selectedFilter.label.toLowerCase()} records yet. Start a new request and it will appear in this tab.`;

    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <EmptyIcon size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={selectedFilter.ctaPath} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700">
            {selectedFilter.ctaLabel}
          </Link>
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              View All Services
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Please log in first</h1>
          <p className="mt-2 text-sm text-gray-600">You need an account to view your patient services.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isPatientUser) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Patient account required</h1>
          <p className="mt-2 text-sm text-gray-600">
            My Care Services is available only for patient accounts.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user?.roles?.includes('hospital_admin') && (
              <Link
                to="/hospital-admin"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                Go to Hospital Admin
              </Link>
            )}
            {user?.roles?.includes('pharmacy_admin') && (
              <Link
                to="/pharmacy-admin"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                Go to Pharmacy Admin
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Patient Services</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">My Care Services</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Manage doctor appointments, E-Doctor consultations, ambulance requests, and E-Medicine orders in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchServices}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">Total Services</p>
              <ClipboardList className="h-5 w-5 text-primary-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">Active</p>
              <Clock className="h-5 w-5 text-sky-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">Completed</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="rounded-lg border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">Can Cancel</p>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.cancelable}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          {serviceFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`h-10 flex-shrink-0 rounded-md px-4 text-sm font-bold transition ${
                activeFilter === filter.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeFilter === filter.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {serviceCounts[filter.value] || 0}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="animate-pulse space-y-5">
                  <div className="h-5 w-56 rounded bg-gray-200" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="h-16 rounded bg-gray-100" />
                    <div className="h-16 rounded bg-gray-100" />
                    <div className="h-16 rounded bg-gray-100" />
                    <div className="h-16 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => {
              const meta = serviceMeta[service.kind];
              const Icon = meta.icon;
              const cancellable = canCancel(service);

              return (
                <article
                  key={service.id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border ${meta.accent}`}>
                        <Icon size={26} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{meta.label}</span>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                              statusStyles[service.status] || 'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          >
                            {formatStatus(service.status)}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-gray-900">{service.title}</h2>
                        <p className="mt-1 text-sm font-semibold text-primary-700">{service.subtitle}</p>
                        <p className="mt-2 text-sm text-gray-500">Reference: {service.reference}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                      <div className="rounded-lg border border-gray-200 bg-slate-50 px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-500">Amount</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">BDT {service.amount || 0}</p>
                      </div>
                      {cancellable && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(service)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
                      <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Date</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(service.date)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
                      <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Time</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatTime(service.time)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
                      <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Provider</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{service.provider}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
                      <ClipboardList className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Details</p>
                        <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{service.detail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Payment</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{formatStatus(service.paymentStatus || 'not available')}</p>
                    </div>
                    {service.notes && (
                      <p className="max-w-2xl text-sm leading-6 text-gray-600">{service.notes}</p>
                    )}
                    {!cancellable && (
                      <p className="text-sm font-semibold text-gray-500">Cancellation unavailable at this stage</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cancel service</h2>
                <p className="mt-1 text-sm text-gray-600">{cancelTarget.cancelMessage}</p>
              </div>
              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-gray-900">{cancelTarget.title}</p>
                <p className="mt-1 text-sm text-gray-600">{cancelTarget.reference} · {formatStatus(cancelTarget.status)}</p>
              </div>
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Cancellation reason</span>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                  placeholder="Optional, but helpful for the provider..."
                />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={cancelling}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Keep Service
              </button>
              <button
                type="button"
                onClick={handleCancelService}
                disabled={cancelling}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
