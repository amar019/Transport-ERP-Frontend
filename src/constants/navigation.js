import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Truck,
  Users,
  User,
  UserCheck,
  Building2,
  Receipt,
  CreditCard,
  Coins,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Settings,
  BookOpen,
  Wallet,
} from "lucide-react";
import { ROUTES } from "./paths";

export const MENU_GROUPS = [
  {
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { name: "Booking", icon: FileText, path: ROUTES.BOOKINGS.LIST },
      { name: "Memos", icon: ClipboardCheck, path: ROUTES.MEMOS.LIST },
      { name: "Delivery", icon: Truck, path: ROUTES.OPERATIONS.DELIVERY },
    ],
  },


  {
    group: "FINANCE",
    items: [
      { name: "Customer Ledger", icon: BookOpen, path: ROUTES.FINANCE.CUSTOMER_LEDGER },
      { name: "Delivery Boy Ledger", icon: Wallet, path: ROUTES.FINANCE.DELIVERY_BOY_LEDGER },
      { name: "Transactions", icon: Receipt, path: ROUTES.FINANCE.PAYMENT_TRANSACTIONS },
      { name: "Payments", icon: CreditCard, path: ROUTES.FINANCE.PAYMENTS },
      { name: "Expenses", icon: Coins, path: ROUTES.FINANCE.EXPENSES },
    ],
  },
  {
    group: "MASTERS",
    items: [
      { name: "Customers", icon: Users, path: ROUTES.CUSTOMERS.LIST },
      { name: "Vehicles", icon: Truck, path: ROUTES.MASTERS.VEHICLES },
      { name: "Delivery Boys", icon: UserCheck, path: ROUTES.MASTERS.DELIVERY_BOYS },
      { name: "Branches", icon: Building2, path: ROUTES.MASTERS.BRANCHES },
    ],
  },

  {
    group: "REPORTS",
    items: [
      { name: "Booking Reports", icon: BarChart3, path: ROUTES.REPORTS.BOOKING },
      { name: "Delivery Reports", icon: PieChart, path: ROUTES.REPORTS.DELIVERY },
      { name: "Financial Reports", icon: LineChart, path: ROUTES.REPORTS.FINANCIAL },
    ],
  },
  {
    group: "SETTINGS",
    items: [

      { name: "Settings", icon: Settings, path: ROUTES.SETTINGS.SETTINGS },
    ],
  },
];
