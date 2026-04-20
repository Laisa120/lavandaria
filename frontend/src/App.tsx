import { lazy, Suspense, useEffect, useState } from 'react';
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
import { listStock } from './pages/stock/stockApi';
import { toUserErrorMessage } from './lib/userErrors';
import type { StockItem } from './types/stock';

const Layout = lazy(() => import('./components/Layout').then((m) => ({ default: m.Layout })));
const Dashboard = lazy(() => import('./components/Dashboard').then((m) => ({ default: m.Dashboard })));
const Orders = lazy(() => import('./components/Orders').then((m) => ({ default: m.Orders })));
const Customers = lazy(() => import('./components/Customers').then((m) => ({ default: m.Customers })));
const Services = lazy(() => import('./components/Services').then((m) => ({ default: m.Services })));
const Cashiers = lazy(() => import('./components/Cashiers').then((m) => ({ default: m.Cashiers })));
const Reports = lazy(() => import('./components/Reports').then((m) => ({ default: m.Reports })));
const Settings = lazy(() => import('./components/Settings').then((m) => ({ default: m.Settings })));
const Invoicing = lazy(() => import('./components/Invoicing').then((m) => ({ default: m.Invoicing })));
const Banner = lazy(() => import('./components/Banner').then((m) => ({ default: m.Banner })));
const Login = lazy(() => import('./components/Login').then((m) => ({ default: m.Login })));
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const SupportTechnical = lazy(() =>
  import('./components/support/SupportTechnical').then((m) => ({ default: m.SupportTechnical })),
);
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })));
const StockPage = lazy(() => import('./pages/stock/StockPage'));

const SESSION_KEY = 'lavasys_session_state';

function getPublicRoute(pathname: string): 'landing' | 'about' {
  if (pathname === '/about') return 'about';
  return 'landing';
}

function createEmptySettings(): LaundrySettings {
  return {
    companyName: '',
    landingBannerImage: '',
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
  const [startupError, setStartupError] = useState('');
  const [licenseBlockedMessage, setLicenseBlockedMessage] = useState('');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [publicRoute, setPublicRoute] = useState<'landing' | 'about'>(getPublicRoute(window.location.pathname));

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [settings, setSettings] = useState<LaundrySettings>(createEmptySettings());
  const [users, setUsers] = useState<User[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const shouldApplyAutomaticOutput = (order: Order) =>
    order.status === 'processing' || order.status === 'ready' || order.status === 'delivered';

  const loadStockSummary = async () => {
    try {
      const items = await listStock();
      setStockItems(items);
    } catch {
      setStockItems([]);
    }
  };

  const loadBootstrap = async () => {
    setIsBootstrapping(true);
    setStartupError('');

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
        const parsed = JSON.parse(savedSession) as { userId?: string; activeTab?: string; welcomeDismissed?: boolean };
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
          setShowWelcomeBanner(!parsed.welcomeDismissed);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      setStartupError(toUserErrorMessage(error, 'Não foi possível carregar os dados iniciais.'));
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    void loadStockSummary();
  }, []);

  useEffect(() => {
    void loadStockSummary();
  }, [activeTab]);

  useEffect(() => {
    const handleFocus = () => {
      void loadStockSummary();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'genomni_stock_items' || event.key === 'genomni_stock_movements') {
        void loadStockSummary();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const stockLowCount = stockItems.filter((item) => {
    const automaticOutputQuantity = item.linkedServiceId
      ? orders
          .filter(shouldApplyAutomaticOutput)
          .flatMap((order) => order.items)
          .filter((orderItem) => orderItem.itemId === item.linkedServiceId)
          .reduce((total, orderItem) => total + orderItem.quantity * (item.consumptionPerService ?? 1), 0)
      : 0;

    const quantityAvailable = item.quantityCurrent - automaticOutputQuantity;
    return quantityAvailable <= item.quantityMinimum;
  }).length;

  const stockCriticalCount = stockItems.filter((item) => {
    const automaticOutputQuantity = item.linkedServiceId
      ? orders
          .filter(shouldApplyAutomaticOutput)
          .flatMap((order) => order.items)
          .filter((orderItem) => orderItem.itemId === item.linkedServiceId)
          .reduce((total, orderItem) => total + orderItem.quantity * (item.consumptionPerService ?? 1), 0)
      : 0;

    const quantityAvailable = item.quantityCurrent - automaticOutputQuantity;
    return quantityAvailable < 0;
  }).length;

  useEffect(() => {
    const handlePopState = () => {
      setPublicRoute(getPublicRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleRegisterLaundry = async (newSettings: LaundrySettings) => {
    try {
      const saved = await registerSettings(newSettings);
      setSettings(saved);
      setIsLaundryRegistered(true);
      setView('login');
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível registrar a lavandaria.'));
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
      setShowWelcomeBanner(true);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: loggedUser.id, activeTab: nextTab, welcomeDismissed: false }));
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível iniciar sessão.'));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setPublicRoute('landing');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setLicenseBlockedMessage('');
    sessionStorage.removeItem(SESSION_KEY);
  };

  useEffect(() => {
    if (!user) return;
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: user.id, activeTab, welcomeDismissed: !showWelcomeBanner }),
    );
  }, [user, activeTab, showWelcomeBanner]);

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
      alert(toUserErrorMessage(error, 'Não foi possível criar o pedido.'));
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      const saved = await updateOrder(updatedOrder);
      setOrders((prev) => prev.map((order) => (order.id === saved.id ? saved : order)));
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível atualizar o pedido.'));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const saved = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === saved.id ? saved : order)));
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível atualizar o estado do pedido.'));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteOrder(orderId);
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } catch (error) {
        alert(toUserErrorMessage(error, 'Não foi possível excluir o pedido.'));
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
      alert(toUserErrorMessage(error, 'Não foi possível cadastrar o cliente.'));
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
      alert(toUserErrorMessage(error, 'Não foi possível atualizar o cliente.'));
      throw error;
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCustomer(customerId);
        setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
      } catch (error) {
        alert(toUserErrorMessage(error, 'Não foi possível excluir o cliente.'));
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
      return created;
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível criar o serviço.'));
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(serviceId);
        setLaundryItems((prev) => prev.filter((service) => service.id !== serviceId));
      } catch (error) {
        alert(toUserErrorMessage(error, 'Não foi possível excluir o serviço.'));
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
      return saved;
    } catch (error) {
      alert(toUserErrorMessage(error, 'Não foi possível editar o serviço.'));
      throw error;
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
      alert(toUserErrorMessage(error, 'Não foi possível criar o utilizador.'));
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
      alert(toUserErrorMessage(error, 'Não foi possível atualizar o utilizador.'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (error) {
        alert(toUserErrorMessage(error, 'Não foi possível excluir o utilizador.'));
      }
    }
  };

  if (isBootstrapping) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando sistema...</div>;
  }

  if (startupError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Não foi possível abrir o sistema</h2>
          <p className="text-slate-600 mb-6">{startupError}</p>
          <button
            onClick={loadBootstrap}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-semibold"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const pageLoader = <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;

  if (view === 'landing' && publicRoute === 'about') {
    return (
      <Suspense fallback={pageLoader}>
        <AboutPage
          settings={settings}
          onBack={() => {
            window.history.pushState({}, '', '/');
            setPublicRoute('landing');
          }}
        />
      </Suspense>
    );
  }

  if (view === 'landing') {
    return (
      <Suspense fallback={pageLoader}>
        <LandingPage
          isRegistered={isLaundryRegistered}
          settings={settings}
          onRegister={handleRegisterLaundry}
          onProceedToLogin={() => setView('login')}
          onOpenAbout={() => {
            window.history.pushState({}, '', '/about');
            setPublicRoute('about');
          }}
        />
      </Suspense>
    );
  }

  if (view === 'login' || !user) {
    return (
      <Suspense fallback={pageLoader}>
        <Login onLogin={handleLogin} onBack={() => setView('landing')} />
      </Suspense>
    );
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
            {showWelcomeBanner && (
              <Banner settings={settings} onClose={() => setShowWelcomeBanner(false)} />
            )}
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
      case 'stock':
        return user.role === 'admin' ? <StockPage orders={orders} services={laundryItems} /> : null;
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
    <Suspense fallback={pageLoader}>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        settings={settings}
        onLogout={handleLogout}
        stockLowCount={stockLowCount}
        stockCriticalCount={stockCriticalCount}
      >
        {renderContent()}
      </Layout>
    </Suspense>
  );
}
