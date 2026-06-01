// Search keyword: Page Super Admin Dashboard - admins, services, payments, subscriptions, and request management tabs.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Building2, CalendarDays, CreditCard, Pill, Stethoscope, Truck, Users } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { authAPI } from '../api/auth';
import { hospitalsAPI } from '../api/hospitals';
import { doctorsAPI } from '../api/doctors';
import { emedicineAPI } from '../api/emedicine';
import { ambulanceAPI } from '../api/ambulance';
import { appointmentsAPI } from '../api/appointments';
import { edoctorAPI } from '../api/edoctor';
import paymentsAPI from '../api/payments';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/AdminDashboard.css';

const adminRoleOptions = ['hospital_admin', 'pharmacy_admin', 'ambulance_driver_admin', 'admin'];
const adminRoleSet = new Set(adminRoleOptions);
const userRoleLabels = {
  patient: 'Patient',
  hospital_admin: 'Hospital Admin',
  pharmacy_admin: 'Pharmacy Admin',
  ambulance_driver_admin: 'Ambulance Driver Admin',
  doctor: 'Doctor',
  donor: 'Donor',
  admin: 'Super Admin',
};
const paymentStatuses = ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'];
const subscriptionStatuses = ['active', 'inactive', 'expired', 'cancelled'];
const subscriptionRevenueRoles = ['hospital_admin', 'pharmacy_admin', 'ambulance_driver_admin', 'admin'];

// Super admin tab definitions: each id matches a renderTable branch below.
const tabs = [
  { id: 'admins', label: 'Admins', icon: Users },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
  { id: 'medicines', label: 'Medicines', icon: Pill },
  { id: 'ambulances', label: 'Ambulances', icon: Truck },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'medicineOrders', label: 'Medicine Orders', icon: Activity },
  { id: 'ambulanceRequests', label: 'Ambulance Requests', icon: Truck },
  { id: 'edoctors', label: 'E-Doctors', icon: Stethoscope },
  { id: 'consultations', label: 'Consultations', icon: Stethoscope },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
];

const getRows = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.results || [];
};

const getTotalCount = (response) => {
  const data = response?.data ?? response;
  if (typeof data?.count === 'number') return data.count;
  return getRows(response).length;
};

// Search keyword: Super Admin Load All Database Rows - follows paginated API responses for all tabs.
const fetchAllRows = async (fetchPage, filters = {}) => {
  const firstResponse = await fetchPage(filters);
  const firstData = firstResponse?.data ?? firstResponse;
  const firstRows = getRows(firstResponse);

  if (!firstData?.next) {
    return { rows: firstRows, count: getTotalCount(firstResponse) };
  }

  const rows = [...firstRows];
  const count = typeof firstData.count === 'number' ? firstData.count : rows.length;
  let page = Number(filters.page || 1) + 1;
  let hasNext = Boolean(firstData.next);

  while (hasNext && page <= 100) {
    const response = await fetchPage({ ...filters, page });
    const data = response?.data ?? response;
    rows.push(...getRows(response));
    hasNext = Boolean(data?.next);
    page += 1;
  }

  return { rows, count };
};

const getMessage = (err, fallback) => {
  const data = err?.response?.data || err?.data || err;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (typeof data === 'object' && data !== null) {
    const fieldMessages = Object.entries(data)
      .filter(([key]) => !['detail', 'error', 'message'].includes(key))
      .map(([key, value]) => {
        const message = Array.isArray(value) ? value.join(' ') : String(value);
        return `${key.replaceAll('_', ' ')}: ${message}`;
      })
      .filter(Boolean);
    if (fieldMessages.length) return fieldMessages.join(' ');
  }
  return err?.message || fallback;
};

const getUserRoleValue = (account) => {
  if (account.is_superuser) return 'admin';
  return (account.roles || []).find((role) => adminRoleSet.has(role)) || 'hospital_admin';
};

const getUserRoleLabel = (account) => {
  if (account.is_superuser) return 'Main Super Admin';
  const roles = (account.roles || []).filter((role) => adminRoleSet.has(role));
  return roles.map((role) => userRoleLabels[role] || role).join(', ') || 'Unknown Admin';
};

const isAdminAccount = (account) => (
  account.is_superuser || (account.roles || []).some((role) => adminRoleSet.has(role))
);

const isPatientAccount = (account) => (
  !isAdminAccount(account) && (account.roles || []).includes('patient')
);

const getAccountName = (account) => {
  const fullName = [account.first_name, account.last_name].filter(Boolean).join(' ').trim();
  return fullName || account.email || `User #${account.id}`;
};

// Search keyword: Super Admin Subscription Admin Type Lookup - maps subscription user to admin role.
const getSubscriptionAdminRole = (subscription, admins) => {
  const admin = admins.find((account) => Number(account.id) === Number(subscription.user));
  if (admin?.is_superuser) return 'admin';
  return (admin?.roles || []).find((role) => subscriptionRevenueRoles.includes(role)) || 'unknown';
};

const getDoctorName = (doctor) => {
  const user = doctor.user || {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || doctor.name || doctor.email || `Doctor #${doctor.id}`;
};

const parseMoney = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (amount) => `BDT ${parseMoney(amount).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const validateAdminForm = (admin) => {
  const errors = {};
  const phonePattern = /^(?:\+?88)?01[3-9]\d{8}$/;
  const password = admin.password || '';

  if (!String(admin.full_name || '').trim()) {
    errors.full_name = 'Full name is required.';
  }
  if (!String(admin.email || '').trim().toLowerCase().endsWith('@gmail.com')) {
    errors.email = 'Use a valid Gmail address.';
  }
  if (!phonePattern.test(String(admin.phone || '').trim())) {
    errors.phone = 'Use a valid Bangladesh phone number, for example 01712345678.';
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.password = 'Password must include uppercase, lowercase, number, and special character.';
  }
  if (!admin.roles?.[0]) {
    errors.roles = 'Select an admin role.';
  }

  return errors;
};

const getFieldErrors = (err) => {
  const data = err?.response?.data || err?.data || err;
  if (!data || typeof data !== 'object') return {};
  return Object.entries(data).reduce((errors, [key, value]) => {
    if (['detail', 'error', 'message', 'non_field_errors'].includes(key)) return errors;
    const message = Array.isArray(value) ? value.join(' ') : String(value);
    return { ...errors, [key]: message };
  }, {});
};

// Main component: renders the super admin control dashboard.
export default function SuperAdminDashboard() {
  useSEO(pageMetadata.superAdmin);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Controls which super admin dashboard tab is currently open.
  const [activeTab, setActiveTab] = useState('admins');
  const [data, setData] = useState({
    admins: [],
    hospitals: [],
    doctors: [],
    pharmacies: [],
    medicines: [],
    ambulances: [],
    appointments: [],
    medicineOrders: [],
    ambulanceRequests: [],
    edoctors: [],
    consultations: [],
    payments: [],
    subscriptions: [],
  });
  const [summaryCounts, setSummaryCounts] = useState({
    users: 0,
    hospitals: 0,
    doctors: 0,
    pharmacies: 0,
    medicines: 0,
    ambulances: 0,
    edoctors: 0,
    payments: 0,
    subscriptions: 0,
  });
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    roles: ['hospital_admin'],
  });
  const [newSubscription, setNewSubscription] = useState({
    user: '',
    plan: 'basic',
    duration: 'monthly',
    amount: '99',
    status: 'active',
    end_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminFormErrors, setAdminFormErrors] = useState({});

  const isSuperAdmin = user?.is_superuser || user?.roles?.includes('admin');

  useEffect(() => {
    if (user && !isSuperAdmin) navigate('/');
  }, [isSuperAdmin, navigate, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      // Search keyword: Super Admin Dashboard Database Loading - fetch all CRUD tab data from backend APIs.
      const [
        usersData,
        hospitalsData,
        doctorsData,
        pharmaciesData,
        medicinesData,
        ambulancesData,
        appointmentsData,
        ordersData,
        ambulanceRequestsData,
        edoctorsData,
        consultationsData,
        paymentsData,
        subscriptionsData,
      ] = await Promise.all([
        fetchAllRows(authAPI.listUsers),
        fetchAllRows(hospitalsAPI.list),
        fetchAllRows(doctorsAPI.list),
        fetchAllRows(emedicineAPI.listPharmacies),
        fetchAllRows(emedicineAPI.listMedicines),
        fetchAllRows(ambulanceAPI.listServices),
        fetchAllRows(appointmentsAPI.list),
        fetchAllRows(emedicineAPI.listOrders),
        fetchAllRows(ambulanceAPI.listRequests),
        fetchAllRows(edoctorAPI.listDoctors),
        fetchAllRows(edoctorAPI.listConsultations),
        fetchAllRows(paymentsAPI.listPayments),
        fetchAllRows(paymentsAPI.listSubscriptions),
      ]);

      setData({
        admins: usersData.rows,
        hospitals: hospitalsData.rows,
        doctors: doctorsData.rows,
        pharmacies: pharmaciesData.rows,
        medicines: medicinesData.rows,
        ambulances: ambulancesData.rows,
        appointments: appointmentsData.rows,
        medicineOrders: ordersData.rows,
        ambulanceRequests: ambulanceRequestsData.rows,
        edoctors: edoctorsData.rows,
        consultations: consultationsData.rows,
        payments: paymentsData.rows,
        subscriptions: subscriptionsData.rows,
      });
      setSummaryCounts({
        users: usersData.count,
        hospitals: hospitalsData.count,
        doctors: doctorsData.count,
        pharmacies: pharmaciesData.count,
        medicines: medicinesData.count,
        ambulances: ambulancesData.count,
        edoctors: edoctorsData.count,
        payments: paymentsData.count,
        subscriptions: subscriptionsData.count,
      });
    } catch (err) {
      setError(getMessage(err, 'Failed to load super admin data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) loadDashboard();
  }, [isSuperAdmin]);

  // Search keyword: Super Admin Subscription Revenue Total - calculates total paid subscription revenue.
  const subscriptionRevenue = useMemo(() => {
    return data.subscriptions.reduce((total, subscription) => {
      const isPaidSubscription = !subscription.is_trial && ['active', 'expired'].includes(subscription.status);
      return isPaidSubscription ? total + parseMoney(subscription.amount) : total;
    }, 0);
  }, [data.subscriptions]);

  // Search keyword: Super Admin Subscription Revenue By Admin Type - groups revenue by hospital/pharmacy/ambulance admins.
  const subscriptionRevenueByRole = useMemo(() => {
    const initialRevenue = [...subscriptionRevenueRoles, 'unknown'].reduce((totals, role) => ({
      ...totals,
      [role]: {
        count: 0,
        revenue: 0,
        label: userRoleLabels[role] || 'Unknown Admin',
      },
    }), {});

    return data.subscriptions.reduce((totals, subscription) => {
      const isPaidSubscription = !subscription.is_trial && ['active', 'expired'].includes(subscription.status);
      if (!isPaidSubscription) return totals;

      const role = getSubscriptionAdminRole(subscription, data.admins);
      const current = totals[role] || totals.unknown;
      return {
        ...totals,
        [role]: {
          ...current,
          count: current.count + 1,
          revenue: current.revenue + parseMoney(subscription.amount),
        },
      };
    }, initialRevenue);
  }, [data.admins, data.subscriptions]);

  // Search keyword: Super Admin Subscription Revenue Graph Data - sorted bar chart data for subscription revenue.
  const subscriptionRevenueBreakdown = useMemo(() => {
    return Object.entries(subscriptionRevenueByRole)
      .map(([role, item]) => ({ role, ...item }))
      .filter((item) => item.revenue > 0 || item.count > 0)
      .sort((first, second) => second.revenue - first.revenue);
  }, [subscriptionRevenueByRole]);

  const summaryCards = useMemo(() => ([
    { label: 'Users', value: summaryCounts.users },
    { label: 'Hospitals', value: summaryCounts.hospitals },
    { label: 'Doctors', value: summaryCounts.doctors },
    { label: 'Pharmacies', value: summaryCounts.pharmacies },
    { label: 'Medicines', value: summaryCounts.medicines },
    { label: 'Ambulances', value: summaryCounts.ambulances },
    { label: 'E-Doctors', value: summaryCounts.edoctors },
    { label: 'Payments', value: summaryCounts.payments },
    { label: 'Subscriptions', value: summaryCounts.subscriptions },
    { label: 'Subscription Revenue', value: formatCurrency(subscriptionRevenue) },
  ]), [summaryCounts, subscriptionRevenue]);

  const runAction = async (action, message = 'Updated successfully') => {
    try {
      setSaving(true);
      setError('');
      await action();
      setSuccess(message);
    } catch (err) {
      if (err?.suppressGlobalError) return;
      const message = getMessage(err, 'Action failed');
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    const validationErrors = validateAdminForm(newAdmin);
    if (Object.keys(validationErrors).length) {
      setAdminFormErrors(validationErrors);
      setError('');
      return;
    }
    setAdminFormErrors({});
    await runAction(async () => {
      try {
        await authAPI.createUser({
          full_name: newAdmin.full_name.trim(),
          email: newAdmin.email.trim().toLowerCase(),
          phone: newAdmin.phone.trim(),
          password: newAdmin.password,
          roles: newAdmin.roles,
          is_active: true,
        });
      } catch (err) {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) {
          setAdminFormErrors(fieldErrors);
          throw { suppressGlobalError: true };
        }
        throw err;
      }
      setNewAdmin({ full_name: '', email: '', phone: '', password: '', roles: ['hospital_admin'] });
      setAdminFormErrors({});
      await loadDashboard();
    }, 'Admin account created');
  };

  const updateAdmin = async (admin, updates) => {
    await runAction(async () => {
      const response = await authAPI.updateUser(admin.id, updates);
      const updated = response.data;
      setData((current) => ({
        ...current,
        admins: current.admins.map((item) => item.id === admin.id ? updated : item),
      }));
    }, 'Admin account updated');
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Delete account ${admin.email}?`)) return;
    await runAction(async () => {
      await authAPI.deleteUser(admin.id);
      setData((current) => ({
        ...current,
        admins: current.admins.filter((item) => item.id !== admin.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        users: Math.max(0, current.users - 1),
      }));
    }, 'Account deleted');
  };

  const updateService = async (type, item, updates) => {
    await runAction(async () => {
      const apiMap = {
        hospitals: hospitalsAPI.update,
        pharmacies: emedicineAPI.updatePharmacy,
        ambulances: ambulanceAPI.updateAmbulance,
      };
      const response = await apiMap[type](item.id, updates);
      const updated = response.data || response;
      setData((current) => ({
        ...current,
        [type]: current[type].map((row) => row.id === item.id ? { ...row, ...updated } : row),
      }));
    }, 'Service updated');
  };

  const deleteService = async (type, item) => {
    if (!window.confirm(`Delete ${item.name || item.order_id || item.request_id}?`)) return;
    await runAction(async () => {
      const apiMap = {
        hospitals: hospitalsAPI.delete,
        pharmacies: emedicineAPI.deletePharmacy,
        ambulances: ambulanceAPI.deleteAmbulance,
      };
      try {
        await apiMap[type](item.id);
      } catch (err) {
        if (type !== 'pharmacies') throw err;
        await emedicineAPI.updatePharmacy(item.id, { is_available: false });
      }
      setData((current) => ({
        ...current,
        [type]: current[type].filter((row) => row.id !== item.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        [type]: Math.max(0, current[type] - 1),
      }));
    }, 'Service deleted');
  };

  // Search keyword: Super Admin Doctors CRUD Actions - update/delete all hospital doctors.
  const updateDoctor = async (doctor, updates) => {
    await runAction(async () => {
      const response = await doctorsAPI.patch(doctor.id, updates);
      const updated = response.data || response;
      setData((current) => ({
        ...current,
        doctors: current.doctors.map((item) => item.id === doctor.id ? { ...item, ...updated } : item),
      }));
    }, 'Doctor updated');
  };

  const deleteDoctor = async (doctor) => {
    if (!window.confirm(`Delete ${getDoctorName(doctor)}?`)) return;
    await runAction(async () => {
      await doctorsAPI.delete(doctor.id);
      setData((current) => ({
        ...current,
        doctors: current.doctors.filter((item) => item.id !== doctor.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        doctors: Math.max(0, current.doctors - 1),
      }));
    }, 'Doctor deleted');
  };

  // Search keyword: Super Admin Medicines CRUD Actions - update/delete all pharmacy medicines.
  const updateMedicine = async (medicine, updates) => {
    await runAction(async () => {
      const response = await emedicineAPI.updateMedicine(medicine.id, updates);
      const updated = response.data || response;
      setData((current) => ({
        ...current,
        medicines: current.medicines.map((item) => item.id === medicine.id ? { ...item, ...updated } : item),
      }));
    }, 'Medicine updated');
  };

  const deleteMedicine = async (medicine) => {
    if (!window.confirm(`Delete medicine ${medicine.name}?`)) return;
    await runAction(async () => {
      await emedicineAPI.deleteMedicine(medicine.id);
      setData((current) => ({
        ...current,
        medicines: current.medicines.filter((item) => item.id !== medicine.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        medicines: Math.max(0, current.medicines - 1),
      }));
    }, 'Medicine deleted');
  };

  const updateMedicineOrder = async (order, status) => {
    await runAction(async () => {
      await emedicineAPI.updateOrderStatus(order.id, status);
      setData((current) => ({
        ...current,
        medicineOrders: current.medicineOrders.map((item) => item.id === order.id ? { ...item, status } : item),
      }));
    }, 'Medicine order updated');
  };

  const deleteMedicineOrder = async (order) => {
    if (!window.confirm(`Delete medicine order ${order.order_id}?`)) return;
    await runAction(async () => {
      await emedicineAPI.deleteOrder(order.id);
      setData((current) => ({
        ...current,
        medicineOrders: current.medicineOrders.filter((item) => item.id !== order.id),
      }));
    }, 'Medicine order deleted');
  };

  const updateAmbulanceRequest = async (request, status) => {
    await runAction(async () => {
      await ambulanceAPI.updateStatus(request.id, status);
      setData((current) => ({
        ...current,
        ambulanceRequests: current.ambulanceRequests.map((item) => item.id === request.id ? { ...item, status } : item),
      }));
    }, 'Ambulance request updated');
  };

  const deleteAmbulanceRequest = async (request) => {
    if (!window.confirm(`Delete ambulance request ${request.request_id}?`)) return;
    await runAction(async () => {
      await ambulanceAPI.deleteRequest(request.id);
      setData((current) => ({
        ...current,
        ambulanceRequests: current.ambulanceRequests.filter((item) => item.id !== request.id),
      }));
    }, 'Ambulance request deleted');
  };

  const updateAppointment = async (appointment, status) => {
    await runAction(async () => {
      if (status === 'confirmed') await appointmentsAPI.confirm(appointment.id);
      if (status === 'cancelled') await appointmentsAPI.cancel(appointment.id, 'Cancelled by super admin');
      setData((current) => ({
        ...current,
        appointments: current.appointments.map((item) => item.id === appointment.id ? { ...item, status } : item),
      }));
    }, 'Appointment updated');
  };

  const deleteAppointment = async (appointment) => {
    if (!window.confirm(`Delete appointment ${appointment.appointment_no}?`)) return;
    await runAction(async () => {
      await appointmentsAPI.delete(appointment.id);
      setData((current) => ({
        ...current,
        appointments: current.appointments.filter((item) => item.id !== appointment.id),
      }));
    }, 'Appointment deleted');
  };

  const updateConsultation = async (consultation, status) => {
    await runAction(async () => {
      if (status === 'confirmed') await edoctorAPI.confirmConsultation(consultation.id);
      if (status === 'cancelled') await edoctorAPI.cancelConsultation(consultation.id);
      if (status === 'ongoing') await edoctorAPI.startConsultation(consultation.id);
      if (status === 'completed') await edoctorAPI.completeConsultation(consultation.id);
      setData((current) => ({
        ...current,
        consultations: current.consultations.map((item) => item.id === consultation.id ? { ...item, status } : item),
      }));
    }, 'E-Doctor consultation updated');
  };

  const deleteConsultation = async (consultation) => {
    if (!window.confirm(`Delete consultation ${consultation.consultation_id}?`)) return;
    await runAction(async () => {
      await edoctorAPI.deleteConsultation(consultation.id);
      setData((current) => ({
        ...current,
        consultations: current.consultations.filter((item) => item.id !== consultation.id),
      }));
    }, 'E-Doctor consultation deleted');
  };

  // Search keyword: Super Admin E-Doctors CRUD Actions - update/delete all e-doctor profiles.
  const updateEdoctor = async (edoctor, updates) => {
    await runAction(async () => {
      const response = await edoctorAPI.patchEdoctor(edoctor.id, updates);
      const updated = response.data || response;
      setData((current) => ({
        ...current,
        edoctors: current.edoctors.map((item) => item.id === edoctor.id ? { ...item, ...updated } : item),
      }));
    }, 'E-Doctor updated');
  };

  const deleteEdoctor = async (edoctor) => {
    if (!window.confirm(`Delete E-Doctor ${edoctor.name}?`)) return;
    await runAction(async () => {
      await edoctorAPI.deleteEdoctor(edoctor.id);
      setData((current) => ({
        ...current,
        edoctors: current.edoctors.filter((item) => item.id !== edoctor.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        edoctors: Math.max(0, current.edoctors - 1),
      }));
    }, 'E-Doctor deleted');
  };

  const updatePayment = async (payment, updates) => {
    await runAction(async () => {
      const response = await paymentsAPI.updatePayment(payment.id, updates);
      setData((current) => ({
        ...current,
        payments: current.payments.map((item) => item.id === payment.id ? response : item),
      }));
    }, 'Payment updated');
  };

  const refundPayment = async (payment) => {
    const reason = window.prompt('Refund reason:', 'Refunded by super admin');
    if (reason === null) return;
    await runAction(async () => {
      await paymentsAPI.refundPayment(payment.id, reason);
      await loadDashboard();
    }, 'Payment refunded');
  };

  const deletePayment = async (payment) => {
    if (!window.confirm(`Delete payment ${payment.transaction_id}?`)) return;
    await runAction(async () => {
      await paymentsAPI.deletePayment(payment.id);
      setData((current) => ({
        ...current,
        payments: current.payments.filter((item) => item.id !== payment.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        payments: Math.max(0, current.payments - 1),
      }));
    }, 'Payment deleted');
  };

  const createSubscription = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      await paymentsAPI.createSubscriptionRecord({
        ...newSubscription,
        amount: Number.parseFloat(newSubscription.amount || 0),
        features: {},
      });
      setNewSubscription({ user: '', plan: 'basic', duration: 'monthly', amount: '99', status: 'active', end_date: '' });
      await loadDashboard();
    }, 'Subscription added');
  };

  const updateSubscription = async (subscription, updates) => {
    await runAction(async () => {
      const response = await paymentsAPI.updateSubscription(subscription.id, updates);
      setData((current) => ({
        ...current,
        subscriptions: current.subscriptions.map((item) => item.id === subscription.id ? response : item),
      }));
    }, 'Subscription updated');
  };

  const cancelSubscription = async (subscription) => {
    await runAction(async () => {
      await paymentsAPI.cancelSubscription(subscription.id);
      setData((current) => ({
        ...current,
        subscriptions: current.subscriptions.map((item) => item.id === subscription.id ? { ...item, status: 'cancelled' } : item),
      }));
    }, 'Subscription cancelled');
  };

  const deleteSubscription = async (subscription) => {
    if (!window.confirm(`Delete subscription #${subscription.id}?`)) return;
    await runAction(async () => {
      await paymentsAPI.deleteSubscription(subscription.id);
      setData((current) => ({
        ...current,
        subscriptions: current.subscriptions.filter((item) => item.id !== subscription.id),
      }));
      setSummaryCounts((current) => ({
        ...current,
        subscriptions: Math.max(0, current.subscriptions - 1),
      }));
    }, 'Subscription deleted');
  };

  if (!isSuperAdmin) return null;

  // Tab content renderer: returns the table or form for the selected super admin tab.
  const renderTable = () => {
    if (activeTab === 'admins') {
      // Admins tab: create admins, change roles/status, reset passwords, and delete admins.
      return (
        <>
          <AdminCreateForm
            newAdmin={newAdmin}
            setNewAdmin={setNewAdmin}
            onSubmit={createAdmin}
            saving={saving}
            fieldErrors={adminFormErrors}
            setFieldErrors={setAdminFormErrors}
          />
          <Table headers={['Name', 'Email', 'Phone', 'Admin Type', 'Active', 'Actions']}>
            {data.admins.filter(isAdminAccount).map((admin) => (
              <tr key={admin.id}>
                <td>{admin.first_name} {admin.last_name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>
                  {admin.is_superuser ? (
                    <strong>{getUserRoleLabel(admin)}</strong>
                  ) : (
                    <select
                      value={getUserRoleValue(admin)}
                      onChange={(event) => updateAdmin(admin, { roles: [event.target.value] })}
                    >
                      {adminRoleOptions.map((role) => <option key={role} value={role}>{userRoleLabels[role] || role}</option>)}
                    </select>
                  )}
                </td>
                <td>
                  <input type="checkbox" checked={admin.is_active} onChange={(event) => updateAdmin(admin, { is_active: event.target.checked })} />
                </td>
                <td>
                  <button className="btn-edit" onClick={() => updateAdmin(admin, { password: window.prompt('New password for this account:') || undefined })}>Password</button>
                  {!admin.is_superuser && <button className="btn-delete" onClick={() => deleteAdmin(admin)}>Delete</button>}
                </td>
              </tr>
            ))}
          </Table>
        </>
      );
    }

    if (activeTab === 'patients') {
      // Patients tab: manage patient accounts separately from platform admin accounts.
      return (
        <Table headers={['Name', 'Email', 'Phone', 'District', 'Verified', 'Active', 'Joined', 'Actions']}>
          {data.admins.filter(isPatientAccount).map((patient) => (
            <tr key={patient.id}>
              <td>{getAccountName(patient)}</td>
              <td>{patient.email}</td>
              <td>{patient.phone}</td>
              <td>{patient.district || 'N/A'}</td>
              <td>{patient.is_verified ? 'Yes' : 'No'}</td>
              <td>
                <input type="checkbox" checked={patient.is_active} onChange={(event) => updateAdmin(patient, { is_active: event.target.checked })} />
              </td>
              <td>{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button className="btn-edit" onClick={() => updateAdmin(patient, { password: window.prompt('New password for this account:') || undefined })}>Password</button>
                <button className="btn-delete" onClick={() => deleteAdmin(patient)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'hospitals') {
      // Hospitals tab: view, edit, activate/deactivate, and delete hospital services.
      return (
        <Table headers={['Name', 'Type', 'District', 'Phone', 'Active', 'Actions']}>
          {data.hospitals.map((hospital) => (
            <tr key={hospital.id}>
              <td>{hospital.name}</td>
              <td>{hospital.type}</td>
              <td>{hospital.district}</td>
              <td>{hospital.phone_primary}</td>
              <td><input type="checkbox" checked={hospital.is_active} onChange={(event) => updateService('hospitals', hospital, { is_active: event.target.checked })} /></td>
              <td>
                <button className="btn-edit" onClick={() => updateService('hospitals', hospital, { name: window.prompt('Hospital name:', hospital.name) || hospital.name })}>Edit</button>
                <button className="btn-delete" onClick={() => deleteService('hospitals', hospital)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'doctors') {
      // Doctors tab: show every in-person doctor profile across all hospitals.
      return (
        <Table headers={['Doctor', 'Hospital', 'Specialty', 'Fee', 'Available', 'Verified', 'Actions']}>
          {data.doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{getDoctorName(doctor)}<br />{doctor.user?.email || doctor.bmdc_number}</td>
              <td>{doctor.hospital_name || doctor.hospital || 'Unassigned'}</td>
              <td>{doctor.specialty}{doctor.subspecialty ? ` / ${doctor.subspecialty}` : ''}</td>
              <td>BDT {Number(doctor.consultation_fee || 0).toFixed(2)}</td>
              <td><input type="checkbox" checked={Boolean(doctor.is_available)} onChange={(event) => updateDoctor(doctor, { is_available: event.target.checked })} /></td>
              <td>{doctor.is_verified ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-edit" onClick={() => updateDoctor(doctor, { consultation_fee: Number(window.prompt('Consultation fee:', doctor.consultation_fee) || doctor.consultation_fee) })}>Fee</button>
                <button className="btn-delete" onClick={() => deleteDoctor(doctor)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'pharmacies') {
      // Pharmacies tab: view, edit, enable/disable pharmacy services.
      return (
        <Table headers={['Name', 'Type', 'Phone', 'Admin', 'Available', 'Actions']}>
          {data.pharmacies.map((pharmacy) => (
            <tr key={pharmacy.id}>
              <td>{pharmacy.name}</td>
              <td>{pharmacy.pharmacy_type}</td>
              <td>{pharmacy.phone_number}</td>
              <td>{pharmacy.admin_user_name || 'Unassigned'}</td>
              <td><input type="checkbox" checked={pharmacy.is_available} onChange={(event) => updateService('pharmacies', pharmacy, { is_available: event.target.checked })} /></td>
              <td>
                <button className="btn-edit" onClick={() => updateService('pharmacies', pharmacy, { name: window.prompt('Pharmacy name:', pharmacy.name) || pharmacy.name })}>Edit</button>
                <button className="btn-delete" onClick={() => deleteService('pharmacies', pharmacy)}>Disable</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'medicines') {
      // Medicines tab: show every medicine item added by pharmacy admins.
      return (
        <Table headers={['Medicine', 'Generic', 'Pharmacy', 'Type', 'Price', 'Stock', 'Available', 'Actions']}>
          {data.medicines.map((medicine) => (
            <tr key={medicine.id}>
              <td>{medicine.name}<br />{medicine.strength}{medicine.strength_unit}</td>
              <td>{medicine.generic_name}</td>
              <td>{medicine.pharmacy_name || medicine.pharmacy}</td>
              <td>{medicine.medicine_type}</td>
              <td>BDT {Number(medicine.price || 0).toFixed(2)}</td>
              <td>{medicine.stock}</td>
              <td><input type="checkbox" checked={Boolean(medicine.is_available)} onChange={(event) => updateMedicine(medicine, { is_available: event.target.checked })} /></td>
              <td>
                <button className="btn-edit" onClick={() => updateMedicine(medicine, { price: Number(window.prompt('Medicine price:', medicine.price) || medicine.price) })}>Price</button>
                <button className="btn-edit" onClick={() => updateMedicine(medicine, { stock: Number(window.prompt('Stock:', medicine.stock) || medicine.stock) })}>Stock</button>
                <button className="btn-delete" onClick={() => deleteMedicine(medicine)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'ambulances') {
      // Ambulances tab: view, edit fare/availability, and delete ambulance services.
      return (
        <Table headers={['Name', 'Driver', 'Phone', 'Type', 'Fare/KM', 'Available', 'Actions']}>
          {data.ambulances.map((ambulance) => (
            <tr key={ambulance.id}>
              <td>{ambulance.name}</td>
              <td>{ambulance.driver_name}</td>
              <td>{ambulance.phone_number}</td>
              <td>{ambulance.vehicle_type}</td>
              <td>BDT {Number(ambulance.cost_per_km || 0).toFixed(2)}</td>
              <td><input type="checkbox" checked={ambulance.is_available} onChange={(event) => updateService('ambulances', ambulance, { is_available: event.target.checked })} /></td>
              <td>
                <button className="btn-edit" onClick={() => updateService('ambulances', ambulance, { cost_per_km: Number(window.prompt('Fare per KM:', ambulance.cost_per_km) || ambulance.cost_per_km) })}>Fare</button>
                <button className="btn-delete" onClick={() => deleteService('ambulances', ambulance)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'appointments') {
      // Appointments tab: view and update appointment statuses.
      return (
        <Table headers={['Appointment', 'Patient', 'Type', 'Payment', 'Status', 'Actions']}>
          {data.appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.appointment_no}</td>
              <td>{appointment.patient_name || appointment.patient_email || appointment.patient}</td>
              <td>{appointment.type}</td>
              <td>{appointment.payment_status}</td>
              <td>{appointment.status}</td>
              <td>
                <select value={appointment.status} onChange={(event) => updateAppointment(appointment, event.target.value)}>
                  <option value={appointment.status}>{appointment.status}</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <button className="btn-delete" onClick={() => deleteAppointment(appointment)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'medicineOrders') {
      // Medicine Orders tab: view and update medicine delivery orders.
      return (
        <Table headers={['Order', 'Patient', 'Pharmacy', 'Amount', 'Urgency', 'Payment', 'Actions']}>
          {data.medicineOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_id}</td>
              <td>{order.patient_name}<br />{order.contact_phone}</td>
              <td>{order.pharmacy_name}</td>
              <td>BDT {Number(order.total_amount || 0).toFixed(2)}</td>
              <td>{order.urgency}</td>
              <td>{order.payment_status}</td>
              <td>
                <select value={order.status} onChange={(event) => updateMedicineOrder(order, event.target.value)}>
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="btn-delete" onClick={() => deleteMedicineOrder(order)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'ambulanceRequests') {
      // Ambulance Requests tab: view and update ambulance booking requests.
      return (
        <Table headers={['Request', 'Patient', 'Pickup', 'Urgency', 'Fare', 'Payment', 'Actions']}>
          {data.ambulanceRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.request_id}</td>
              <td>{request.patient_name}<br />{request.contact_phone}</td>
              <td>{request.pickup_location}</td>
              <td>{request.urgency}</td>
              <td>BDT {Number(request.final_fare || request.estimated_fare || 0).toFixed(2)}</td>
              <td>{request.payment_status}</td>
              <td>
                <select value={request.status} onChange={(event) => updateAmbulanceRequest(request, event.target.value)}>
                  {['pending', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="btn-delete" onClick={() => deleteAmbulanceRequest(request)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'payments') {
      // Payments tab: review, update, refund, and delete payment records.
      return (
        <Table headers={['Transaction', 'User', 'For', 'Amount', 'Gateway', 'Status', 'Actions']}>
          {data.payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.transaction_id}</td>
              <td>{payment.user_name}<br />{payment.user_email}</td>
              <td>{payment.payment_type}<br />{payment.hospital_name || payment.pharmacy_name || payment.reference_type}</td>
              <td>{payment.amount} {payment.currency}</td>
              <td>{payment.gateway}</td>
              <td>
                <select value={payment.status} onChange={(event) => updatePayment(payment, { status: event.target.value })}>
                  {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
              <td>
                <button className="btn-edit" onClick={() => refundPayment(payment)} disabled={payment.status !== 'success'}>Refund</button>
                <button className="btn-delete" onClick={() => deletePayment(payment)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'edoctors') {
      // E-Doctors tab: show every E-Doctor profile across the platform.
      return (
        <Table headers={['Doctor', 'Specialization', 'Hospital', 'Fee', 'Available', 'Verified', 'Actions']}>
          {data.edoctors.map((edoctor) => (
            <tr key={edoctor.id}>
              <td>{edoctor.name}<br />{edoctor.phone_number || edoctor.doctor_id}</td>
              <td>{edoctor.specialization_display || edoctor.specialization}</td>
              <td>{edoctor.hospital_display_name || edoctor.hospital_name || 'Private Practice'}</td>
              <td>BDT {Number(edoctor.consultation_fee || 0).toFixed(2)}</td>
              <td><input type="checkbox" checked={Boolean(edoctor.is_available)} onChange={(event) => updateEdoctor(edoctor, { is_available: event.target.checked })} /></td>
              <td>{edoctor.is_verified ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-edit" onClick={() => updateEdoctor(edoctor, { consultation_fee: Number(window.prompt('Consultation fee:', edoctor.consultation_fee) || edoctor.consultation_fee) })}>Fee</button>
                <button className="btn-delete" onClick={() => deleteEdoctor(edoctor)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'subscriptions') {
      // Subscriptions tab: create, update, cancel, and delete admin subscriptions.
      return (
        <>
          {/* Search keyword: Super Admin Subscription Revenue Graph - admin-type revenue chart. */}
          <SubscriptionRevenuePanel
            totalRevenue={subscriptionRevenue}
            breakdown={subscriptionRevenueBreakdown}
          />
          <SubscriptionCreateForm
            admins={data.admins.filter((account) => (
              isAdminAccount(account)
            ))}
            form={newSubscription}
            setForm={setNewSubscription}
            onSubmit={createSubscription}
            saving={saving}
          />
          {/* Search keyword: Super Admin Subscription Admin Type Table - shows which admin type owns each subscription. */}
          <Table headers={['Admin', 'Admin Type', 'Plan', 'Duration', 'Amount', 'End Date', 'Trial', 'Status', 'Actions']}>
            {data.subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.user_email}</td>
                <td>{userRoleLabels[getSubscriptionAdminRole(subscription, data.admins)] || 'Unknown Admin'}</td>
                <td>{subscription.plan}</td>
                <td>{subscription.duration}</td>
                <td>BDT {Number(subscription.amount || 0).toFixed(2)}</td>
                <td>{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</td>
                <td>{subscription.is_trial ? 'Yes' : 'No'}</td>
                <td>
                  <select value={subscription.status} onChange={(event) => updateSubscription(subscription, { status: event.target.value })}>
                    {subscriptionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => cancelSubscription(subscription)}>Cancel</button>
                  <button className="btn-delete" onClick={() => deleteSubscription(subscription)}>Delete</button>
                </td>
              </tr>
            ))}
          </Table>
        </>
      );
    }

    // Consultations tab: view and update e-doctor consultation statuses.
    return (
      <Table headers={['Consultation', 'Patient', 'Doctor', 'Fee', 'Paid', 'Status', 'Actions']}>
        {data.consultations.map((consultation) => (
          <tr key={consultation.id}>
            <td>{consultation.consultation_id}</td>
            <td>{consultation.patient_name}<br />{consultation.patient_phone}</td>
            <td>{consultation.doctor_name || consultation.doctor}</td>
            <td>BDT {Number(consultation.fee_amount || 0).toFixed(2)}</td>
            <td>{consultation.is_paid ? 'Yes' : consultation.payment_status}</td>
            <td>{consultation.status}</td>
            <td>
              <select value={consultation.status} onChange={(event) => updateConsultation(consultation, event.target.value)}>
                {['scheduled', 'confirmed', 'ongoing', 'completed', 'cancelled'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="btn-delete" onClick={() => deleteConsultation(consultation)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    );
  };

  // Page layout: dashboard summary cards, tab buttons, and selected super admin table.
  return (
    <div className="admin-dashboard super-admin-dashboard">
      <div className="admin-header">
        <h1>Super Admin Control</h1>
        <p>Control admins, services, payments, subscriptions, appointments, and requests.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="review-summary" style={{ marginBottom: 24 }}>
        {summaryCards.map(({ label, value }) => (
          <div key={label} className="revenue-card">
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {/* Tab buttons: generated from the tabs list above and used to switch activeTab. */}
      <div className="admin-tabs super-admin-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content: renderTable shows only the currently selected super admin tab. */}
      {loading ? <div className="loading">Loading super admin control...</div> : <div className="admin-content">{renderTable()}</div>}
    </div>
  );
}

function AdminCreateForm({ newAdmin, setNewAdmin, onSubmit, saving, fieldErrors, setFieldErrors }) {
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => {
    setNewAdmin({ ...newAdmin, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  return (
    <form className="admin-content" onSubmit={onSubmit} style={{ marginBottom: 18 }}>
      <h2>Add Admin Account</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input required value={newAdmin.full_name} onChange={(event) => updateField('full_name', event.target.value)} className={fieldErrors.full_name ? 'input-error' : ''} />
          {fieldErrors.full_name && <span className="field-error">{fieldErrors.full_name}</span>}
        </div>
        <div className="form-group">
          <label>Gmail Address *</label>
          <input required type="email" value={newAdmin.email} onChange={(event) => updateField('email', event.target.value)} className={fieldErrors.email ? 'input-error' : ''} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>
        <div className="form-group">
          <label>Bangladesh Phone *</label>
          <input required value={newAdmin.phone} onChange={(event) => updateField('phone', event.target.value)} className={fieldErrors.phone ? 'input-error' : ''} />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </div>
        <div className="form-group">
          <label>Password *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 8 }}>
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={newAdmin.password}
              onChange={(event) => updateField('password', event.target.value)}
              className={fieldErrors.password ? 'input-error' : ''}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPassword((current) => !current)}
              style={{ margin: 0, padding: '0 14px', height: '100%' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>
        <div className="form-group">
          <label>Role *</label>
          <select value={newAdmin.roles[0]} onChange={(event) => setNewAdmin({ ...newAdmin, roles: [event.target.value] })} className={fieldErrors.roles ? 'input-error' : ''}>
            {adminRoleOptions.map((role) => <option key={role} value={role}>{userRoleLabels[role]}</option>)}
          </select>
          {fieldErrors.roles && <span className="field-error">{fieldErrors.roles}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-end', height: 'fit-content' }}>Add Admin</button>
      </div>
    </form>
  );
}

// Search keyword: Component Subscription Revenue Panel - renders total and admin-type revenue bars.
function SubscriptionRevenuePanel({ totalRevenue, breakdown }) {
  const maxRevenue = Math.max(...breakdown.map((item) => item.revenue), 0);

  return (
    <div className="subscription-revenue-panel">
      <div className="subscription-revenue-header">
        <div>
          <h2>Subscription Revenue by Admin Type</h2>
          <p>Total subscription revenue from admin plans.</p>
        </div>
        <div className="subscription-revenue-total">
          <span>Total Revenue</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
      </div>

      <div className="subscription-revenue-chart">
        {breakdown.length === 0 ? (
          <div className="empty-pie">No paid subscription revenue found.</div>
        ) : (
          breakdown.map((item) => {
            const width = maxRevenue ? `${Math.max(6, (item.revenue / maxRevenue) * 100)}%` : '0%';
            const percentage = totalRevenue ? Math.round((item.revenue / totalRevenue) * 100) : 0;

            return (
              <div key={item.role} className="subscription-revenue-row">
                <div className="subscription-revenue-row-main">
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.revenue)}</strong>
                </div>
                <div className="subscription-revenue-bar-track" aria-label={`${item.label} revenue ${percentage}%`}>
                  <div className="subscription-revenue-bar" style={{ width }} />
                </div>
                <div className="subscription-revenue-meta">
                  <span>{item.count} subscriptions</span>
                  <span>{percentage}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SubscriptionCreateForm({ admins, form, setForm, onSubmit, saving }) {
  return (
    <form className="admin-content" onSubmit={onSubmit} style={{ marginBottom: 18 }}>
      <h2>Add Subscription</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Select Admin *</label>
          <select required value={form.user} onChange={(event) => setForm({ ...form, user: event.target.value })}>
            <option value="">Select admin</option>
            {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.email}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Plan</label>
          <select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}>
            <option value="basic">basic</option>
            <option value="premium">premium</option>
            <option value="professional">professional</option>
          </select>
        </div>
        <div className="form-group">
          <label>Duration</label>
          <select value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })}>
            <option value="monthly">monthly</option>
            <option value="quarterly">quarterly</option>
            <option value="annual">annual</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount *</label>
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        </div>
        <div className="form-group">
          <label>End Date *</label>
          <input required type="datetime-local" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {subscriptionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-end', height: 'fit-content' }}>Add Subscription</button>
      </div>
    </form>
  );
}

function Table({ headers, children }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
