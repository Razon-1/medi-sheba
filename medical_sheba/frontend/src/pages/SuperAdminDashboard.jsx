import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Building2, CalendarDays, CreditCard, Pill, Stethoscope, Truck, Users } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { authAPI } from '../api/auth';
import { hospitalsAPI } from '../api/hospitals';
import { emedicineAPI } from '../api/emedicine';
import { ambulanceAPI } from '../api/ambulance';
import { appointmentsAPI } from '../api/appointments';
import { edoctorAPI } from '../api/edoctor';
import paymentsAPI from '../api/payments';
import '../styles/AdminDashboard.css';

const adminRoleOptions = ['hospital_admin', 'pharmacy_admin', 'ambulance_driver_admin', 'admin'];
const adminRoleLabels = {
  hospital_admin: 'Hospital Admin',
  pharmacy_admin: 'Pharmacy Admin',
  ambulance_driver_admin: 'Ambulance Driver Admin',
  admin: 'Super Admin',
};
const paymentStatuses = ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'];
const subscriptionStatuses = ['active', 'inactive', 'expired', 'cancelled'];

const tabs = [
  { id: 'admins', label: 'Admins', icon: Users },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
  { id: 'ambulances', label: 'Ambulances', icon: Truck },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'medicineOrders', label: 'Medicine Orders', icon: Activity },
  { id: 'ambulanceRequests', label: 'Ambulance Requests', icon: Truck },
  { id: 'consultations', label: 'E-Doctor', icon: Stethoscope },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
];

const getRows = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.results || [];
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

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('admins');
  const [data, setData] = useState({
    admins: [],
    hospitals: [],
    pharmacies: [],
    ambulances: [],
    appointments: [],
    medicineOrders: [],
    ambulanceRequests: [],
    consultations: [],
    payments: [],
    subscriptions: [],
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
      const [
        usersRes,
        hospitalsRes,
        pharmaciesRes,
        ambulancesRes,
        appointmentsRes,
        ordersRes,
        ambulanceRequestsRes,
        consultationsRes,
        paymentsRes,
        subscriptionsRes,
      ] = await Promise.all([
        authAPI.listUsers(),
        hospitalsAPI.list(),
        emedicineAPI.listPharmacies(),
        ambulanceAPI.listServices(),
        appointmentsAPI.list(),
        emedicineAPI.listOrders(),
        ambulanceAPI.listRequests(),
        edoctorAPI.listConsultations(),
        paymentsAPI.listPayments(),
        paymentsAPI.listSubscriptions(),
      ]);

      const users = getRows(usersRes);
      const businessAdmins = users.filter((item) => (
        item.is_superuser || (item.roles || []).some((role) => adminRoleOptions.includes(role))
      ));

      setData({
        admins: businessAdmins,
        hospitals: getRows(hospitalsRes),
        pharmacies: getRows(pharmaciesRes),
        ambulances: getRows(ambulancesRes),
        appointments: getRows(appointmentsRes),
        medicineOrders: getRows(ordersRes),
        ambulanceRequests: getRows(ambulanceRequestsRes),
        consultations: getRows(consultationsRes),
        payments: getRows(paymentsRes),
        subscriptions: getRows(subscriptionsRes),
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

  const counts = useMemo(() => ({
    Admins: data.admins.length,
    Hospitals: data.hospitals.length,
    Pharmacies: data.pharmacies.length,
    Ambulances: data.ambulances.length,
    Payments: data.payments.length,
    Subscriptions: data.subscriptions.length,
  }), [data]);

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
    if (!window.confirm(`Delete admin account ${admin.email}?`)) return;
    await runAction(async () => {
      await authAPI.deleteUser(admin.id);
      setData((current) => ({
        ...current,
        admins: current.admins.filter((item) => item.id !== admin.id),
      }));
    }, 'Admin account deleted');
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
        pharmacies: (id) => emedicineAPI.updatePharmacy(id, { is_available: false }),
        ambulances: ambulanceAPI.deleteAmbulance,
      };
      await apiMap[type](item.id);
      setData((current) => ({
        ...current,
        [type]: type === 'pharmacies'
          ? current[type].map((row) => row.id === item.id ? { ...row, is_available: false } : row)
          : current[type].filter((row) => row.id !== item.id),
      }));
    }, type === 'pharmacies' ? 'Pharmacy disabled' : 'Service deleted');
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

  const updateAmbulanceRequest = async (request, status) => {
    await runAction(async () => {
      await ambulanceAPI.updateStatus(request.id, status);
      setData((current) => ({
        ...current,
        ambulanceRequests: current.ambulanceRequests.map((item) => item.id === request.id ? { ...item, status } : item),
      }));
    }, 'Ambulance request updated');
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
    }, 'Subscription deleted');
  };

  if (!isSuperAdmin) return null;

  const renderTable = () => {
    if (activeTab === 'admins') {
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
          <Table headers={['Name', 'Email', 'Phone', 'Roles', 'Active', 'Actions']}>
            {data.admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.first_name} {admin.last_name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>
                  <select
                    value={(admin.roles || []).find((role) => adminRoleOptions.includes(role)) || 'hospital_admin'}
                    onChange={(event) => updateAdmin(admin, { roles: [event.target.value] })}
                    disabled={admin.is_superuser}
                  >
                    {adminRoleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td>
                  <input type="checkbox" checked={admin.is_active} onChange={(event) => updateAdmin(admin, { is_active: event.target.checked })} />
                </td>
                <td>
                  <button className="btn-edit" onClick={() => updateAdmin(admin, { password: window.prompt('New password for this admin:') || undefined })}>Password</button>
                  {!admin.is_superuser && <button className="btn-delete" onClick={() => deleteAdmin(admin)}>Delete</button>}
                </td>
              </tr>
            ))}
          </Table>
        </>
      );
    }

    if (activeTab === 'hospitals') {
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

    if (activeTab === 'pharmacies') {
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

    if (activeTab === 'ambulances') {
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
      return (
        <Table headers={['Appointment', 'Patient', 'Type', 'Payment', 'Status', 'Update']}>
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
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'medicineOrders') {
      return (
        <Table headers={['Order', 'Patient', 'Pharmacy', 'Amount', 'Urgency', 'Payment', 'Status']}>
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
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'ambulanceRequests') {
      return (
        <Table headers={['Request', 'Patient', 'Pickup', 'Urgency', 'Fare', 'Payment', 'Status']}>
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
              </td>
            </tr>
          ))}
        </Table>
      );
    }

    if (activeTab === 'payments') {
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

    if (activeTab === 'subscriptions') {
      return (
        <>
          <SubscriptionCreateForm
            admins={data.admins}
            form={newSubscription}
            setForm={setNewSubscription}
            onSubmit={createSubscription}
            saving={saving}
          />
          <Table headers={['User', 'Plan', 'Duration', 'Amount', 'End Date', 'Trial', 'Status', 'Actions']}>
            {data.subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.user_email}</td>
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

    return (
      <Table headers={['Consultation', 'Patient', 'Doctor', 'Fee', 'Paid', 'Status', 'Action']}>
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
            </td>
          </tr>
        ))}
      </Table>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Super Admin Control</h1>
        <p>Control admins, services, payments, subscriptions, appointments, and requests.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="review-summary" style={{ marginBottom: 24 }}>
        {Object.entries(counts).map(([label, value]) => (
          <div key={label} className="revenue-card">
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

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
            {adminRoleOptions.map((role) => <option key={role} value={role}>{adminRoleLabels[role]}</option>)}
          </select>
          {fieldErrors.roles && <span className="field-error">{fieldErrors.roles}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-end', height: 'fit-content' }}>Add Admin</button>
      </div>
    </form>
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
