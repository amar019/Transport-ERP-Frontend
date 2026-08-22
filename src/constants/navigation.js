import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Truck,
  Users,
  User,
  Building2,
  Receipt,
  CreditCard,
  Coins,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Settings,
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
    group: "MASTERS",
    items: [
      { name: "Customers", icon: Users, path: ROUTES.CUSTOMERS.LIST },
      { name: "Vehicles", icon: Truck, path: ROUTES.MASTERS.VEHICLES },
      { name: "Drivers", icon: User, path: ROUTES.MASTERS.DRIVERS },
      { name: "Branches", icon: Building2, path: ROUTES.MASTERS.BRANCHES },
    ],
  },
  {
    group: "FINANCE",
    items: [
      { name: "Billing", icon: Receipt, path: ROUTES.FINANCE.BILLING },
      { name: "Payments", icon: CreditCard, path: ROUTES.FINANCE.PAYMENTS },
      { name: "Expenses", icon: Coins, path: ROUTES.FINANCE.EXPENSES },
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
      { name: "Users", icon: Users, path: ROUTES.SETTINGS.USERS },
      { name: "Roles & Permissions", icon: Shield, path: ROUTES.SETTINGS.ROLES },
      { name: "Settings", icon: Settings, path: ROUTES.SETTINGS.SETTINGS },
    ],
  },
];
