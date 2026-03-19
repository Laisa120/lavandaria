import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Customers } from './components/Customers';
import { Services } from './components/Services';
import { Cashiers } from './components/Cashiers';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Invoicing } from './components/Invoicing';
import { Banner } from './components/Banner';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { SupportTechnical } from './components/support/SupportTechnical';
import { Customer, LaundryItem, LaundrySettings, Order, User } from './types';
import { checkLicense } from './lib/supportGenomnApi';
import {
  createCustomer,
  createOrder,
  createService,
  createUser,
  deleteCustomer,
  deleteOrder,
  deleteService,
  deleteUser,
  getBootstrap,
  login,
  registerSettings,
  updateCustomer,
  updateOrder,
  updateOrderStatus,
  updateSettings,
  updateService,
  updateUser,
} from './lib/api';

const SESSION_KEY = 'lavasys_session_state';

function createEmptySettings(): LaundrySettings {
  return {
    companyName: '',
    tradeName: '',
    nif: '',
    companyType: 'Lda',
    country: 'Angola',
    province: '',
    municipality: '',
    fullAddress: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    ivaRegime: 'geral',
    defaultIvaRate: 14,
    currency: 'Kz',
    invoiceSeries: new Date().getFullYear().toString(),
    startInvoiceNumber: 1,
    withholdingTaxPercentage: 0,
    bankName: '',
    accountNumber: '',
    iban: '',
    invoiceModel: 'A4',
    invoiceNumberFormat: 'SERIE/NUMERO',
    allowCreditSales: false,
    defaultDueDays: 30,
    allowGlobalDiscount: true,
    printerName: '',
    printerConnectionType: 'usb',
    printerIpAddress: '',
    autoPrintReceipt: false,
    autoDownloadPDF: false,
  };
}

export default function App() {
  const [isLaundryRegistered, setIsLaundryRegistered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<'landing' | 'login' | 'system'>('landing');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [licenseBlockedMessage, setLicenseBlockedMessage] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [settings, setSettings] = useState<LaundrySettings>(createEmptySettings());
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await getBootstrap();
        setIsLaundryRegistered(payload.isRegistered);
        setSettings(payload.settings ?? createEmptySettings());
        setOrders(payload.orders);
        setCustomers(payload.customers);
        setLaundryItems(payload.services);
        setUsers(payload.users);

        const savedSession = sessionStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as { userId?: string; activeTab?: string };
          const currentUser = payload.users.find((u) => u.id === parsed.userId);

          if (currentUser) {
            try {
              const license = await checkLicense(currentUser.id);
              setLicenseBlockedMessage(license.valid ? '' : license.message);
            } catch {
              setLicenseBlockedMessage('');
            }

            setUser(currentUser);
            setView('system');
            setActiveTab(parsed.activeTab ?? (currentUser.role === 'admin' ? 'dashboard' : 'orders'));
          } else {
            sessionStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar dados iniciais';
        alert(message);
      } finally {
        setIsBootstrapping(false);
      }
    };

    load();
  }, []);

  const handleRegisterLaundry = async (newSettings: LaundrySettings) => {
    try {
      const saved = await registerSettings(newSettings);
      setSettings(saved);
      setIsLaundryRegistered(true);
      setView('login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao registrar lavandaria.';
      alert(message);
    }
  };

  const handleLogin = async (payload: { role: User['role']; email: string; password: string }) => {
    try {
      const loggedUser = await login(payload);
      try {
        const license = await checkLicense(loggedUser.id);
        setLicenseBlockedMessage(license.valid ? '' : license.message);
      } catch {
        setLicenseBlockedMessage('');
      }

      setUser(loggedUser);
      setView('system');
      const nextTab = loggedUser.role === 'admin' ? 'dashboard' : 'orders';
      setActiveTab(nextTab);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: loggedUser.id, activeTab: nextTab }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha no login.';
      alert(message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setLicenseBlockedMessage('');
    sessionStorage.removeItem(SESSION_KEY);
  };

  useEffect(() => {
    if (!user) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, activeTab }));
  }, [user, activeTab]);

  const handleAddOrder = async (order: Order) => {
    if (!user) {
      alert('Sessão inválida. Faça login novamente.');
      return;
    }

    try {
      const created = await createOrder({
        customerId: order.customerId,
        userId: user.id,
        items: order.items.map((item) => ({ itemId: item.itemId, quantity: item.quantity })),
        status: order.status,
        paymentStatus: order.paymentStatus,
        expectedDelivery: order.expectedDelivery,
      });
      setOrders((prev) => [created, ...prev]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar pedido.';
      alert(message);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      const saved = await updateOrder(updatedOrder);
      setOrders((prev) => prev.map((order) => (order.id === saved.id ? saved : order)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar pedido.';
      alert(message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const saved = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === saved.id ? saved : order)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar status do pedido.';
      alert(message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteOrder(orderId);
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao excluir pedido.';
        alert(message);
      }
    }
  };

  const handleAddCustomer = async (customer: Customer) => {
    try {
      const created = await createCustomer({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
      setCustomers((prev) => [created, ...prev]);
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao cadastrar cliente.';
      alert(message);
      throw error;
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const saved = await updateCustomer(updatedCustomer.id, {
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
      });
      setCustomers((prev) => prev.map((customer) => (customer.id === saved.id ? saved : customer)));
      return saved;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar cliente.';
      alert(message);
      throw error;
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCustomer(customerId);
        setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao excluir cliente.';
        alert(message);
      }
    }
  };

  const handleAddService = async (service: LaundryItem) => {
    try {
      const created = await createService({
        name: service.name,
        price: service.price,
        category: service.category,
      });
      setLaundryItems((prev) => [created, ...prev]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar serviço.';
      alert(message);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(serviceId);
        setLaundryItems((prev) => prev.filter((service) => service.id !== serviceId));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao excluir serviço.';
        alert(message);
      }
    }
  };

  const handleUpdateService = async (service: LaundryItem) => {
    try {
      const saved = await updateService(service.id, {
        name: service.name,
        price: service.price,
        category: service.category,
      });
      setLaundryItems((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao editar serviço.';
      alert(message);
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      const created = await createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password ?? '123456',
        role: newUser.role,
        status: newUser.status,
      });
      setUsers((prev) => [...prev, created]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar utilizador.';
      alert(message);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const saved = await updateUser(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        role: updatedUser.role,
        status: updatedUser.status,
      });
      setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar utilizador.';
      alert(message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao excluir utilizador.';
        alert(message);
      }
    }
  };

  if (isBootstrapping) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando sistema...</div>;
  }

  if (view === 'landing') {
    return (
      <LandingPage
        isRegistered={isLaundryRegistered}
        onRegister={handleRegisterLaundry}
        onProceedToLogin={() => setView('login')}
      />
    );
  }

  if (view === 'login' || !user) {
    return <Login onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  if (licenseBlockedMessage) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Acesso bloqueado por licença</h2>
          <p className="text-slate-600 mb-6">{licenseBlockedMessage}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? (
          <>
            <Banner />
            <Dashboard orders={orders} customers={customers} />
          </>
        ) : null;
      case 'invoicing':
        return (
          <Invoicing
            orders={orders}
            customers={customers}
            laundryItems={laundryItems}
            settings={settings}
            currentUser={user}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onEmitInvoice={(invoice) => {
              console.log('Invoice emitted:', invoice);
            }}
          />
        );
      case 'orders':
        return (
          <Orders
            orders={orders}
            customers={customers}
            laundryItems={laundryItems}
            settings={settings}
            userRole={user.role}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={customers}
            orders={orders}
            laundryItems={laundryItems}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'reports':
        return (
          <Reports
            orders={orders}
            customers={customers}
            laundryItems={laundryItems}
            userRole={user.role}
            currentUserId={user.id}
          />
        );
      case 'support':
        return (
          <SupportTechnical
            user={user}
            onLicenseStatus={({ blocked, message }) => setLicenseBlockedMessage(blocked ? message : '')}
          />
        );
      case 'services':
        return user.role === 'admin' ? (
          <Services
            services={laundryItems}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
        ) : null;
      case 'cashiers':
        return user.role === 'admin' ? (
          <Cashiers
            cashiers={users}
            onAddCashier={handleAddUser}
            onUpdateCashier={handleUpdateUser}
            onDeleteCashier={handleDeleteUser}
          />
        ) : null;
      case 'settings':
        return user.role === 'admin' ? (
          <Settings
            settings={settings}
            onUpdateSettings={async (newSettings) => {
              const saved = await updateSettings(newSettings);
              setSettings(saved);
            }}
          />
        ) : null;
      default:
        return user.role === 'admin' ? (
          <Dashboard orders={orders} customers={customers} />
        ) : (
          <Orders
            orders={orders}
            customers={customers}
            laundryItems={laundryItems}
            settings={settings}
            userRole={user.role}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} settings={settings} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}
