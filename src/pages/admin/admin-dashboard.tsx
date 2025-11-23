import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import type { PaymentDto } from "@/types/payment-type";
import type { User } from "@/types/user-type";
import axiosPublic from "@/utils/axios/axiosPublic";

export default function AdminDashboardPage() {
  const [roleStats, setRoleStats] = useState<any[]>([]);
  const [usersYear, setUsersYear] = useState(new Date().getFullYear());
  const [monthlyUsers, setMonthlyUsers] = useState<any[]>([]);

  const [bookingsYear, setBookingsYear] = useState(new Date().getFullYear());
  const [monthlyBookings, setMonthlyBookings] = useState<any[]>([]);

  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch role stats
  useEffect(() => {
    const fetchRoleStats = async () => {
      try {
        const res = await axiosPublic.get("/admin/statistic/user-role-stats");
        setRoleStats(res.data?.data ?? []);
      } catch (err) {
        console.error("Role stats fetch failed:", err);
      }
    };
    fetchRoleStats();
  }, []);

  // Fetch monthly users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosPublic.get(`/admin/statistic/user-monthly-stats?year=${usersYear}`);
        setMonthlyUsers(res.data?.data ?? []);
      } catch (err) {
        console.error("Monthly users fetch failed:", err);
      }
    };
    fetchUsers();
  }, [usersYear]);

  // Fetch monthly bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosPublic.get(`/admin/booking-monthly-stats?year=${bookingsYear}`);
        setMonthlyBookings(res.data?.data ?? []);
      } catch (err) {
        console.error("Monthly bookings fetch failed:", err);
      }
    };
    fetchBookings();
  }, [bookingsYear]);

  // Fetch monthly revenue
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axiosPublic.get(`/admin/statistic/payments?year=${revenueYear}`);
        const paymentsData = res.data?.data ?? [];
        setPayments(paymentsData);

        const revenueData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const total = paymentsData
            .filter((p) => new Date(p.createdAt).getMonth() + 1 === month)
            .reduce((sum, p) => sum + p.amount, 0);
          return { month, revenue: total };
        });
        setMonthlyRevenue(revenueData);
      } catch (err) {
        console.error("Monthly revenue fetch failed:", err);
      }
    };
    fetchRevenue();
  }, [revenueYear]);

  // Fetch all users
  useEffect(() => {
    const fetchUsersList = async () => {
      try {
        const res = await axiosPublic.get("/admin/manage/users");
        setUsers(res.data?.data ?? []);
      } catch (err) {
        console.error("Fetch users failed:", err);
      }
    };
    fetchUsersList();
  }, []);

  // Prepare booking chart data
  const bookingTypes = Array.from(new Set(monthlyBookings.map((b) => b.type)));
  const bookingChartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const data: any = { month: monthLabels[i] };
    bookingTypes.forEach((t) => {
      const found = monthlyBookings.find((b) => b.month === month && b.type === t);
      data[t] = found ? found.count : 0;
    });
    return data;
  });

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Role Pie Chart */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart width={350} height={300}>
            <Pie
              data={roleStats}
              dataKey="count"
              nameKey="displayName"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {roleStats.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Monthly Revenue ({revenueYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={String(revenueYear)} onValueChange={(v) => setRevenueYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <BarChart width={400} height={250} data={monthlyRevenue}>
            <XAxis dataKey="month" tickFormatter={(m) => monthLabels[m - 1]} />
            <YAxis
              tickFormatter={(value) =>
                value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M` :
                  value >= 1_000 ? `$${(value / 1_000).toFixed(0)}k` :
                    `$${value}`
              }
            />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Bar dataKey="revenue" fill="#f59e0b" />
          </BarChart>
        </CardContent>
      </Card>

      {/* Monthly Users */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>New Users per Month ({usersYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={String(usersYear)} onValueChange={(v) => setUsersYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <BarChart width={400} height={250} data={monthlyUsers}>
            <XAxis dataKey="month" tickFormatter={(m) => monthLabels[m - 1]} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="newUserCount" fill="#2563eb" />
          </BarChart>
        </CardContent>
      </Card>

      {/* Monthly Bookings */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Monthly Bookings ({bookingsYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={String(bookingsYear)} onValueChange={(v) => setBookingsYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <BarChart width={400} height={250} data={bookingChartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {bookingTypes.map((t, idx) => <Bar key={t} dataKey={t} fill={COLORS[idx % COLORS.length]} />)}
            </BarChart>
          </div>
        </CardContent>
      </Card>

      {/* Manage Users (full width) */}
      <Card className="shadow-xl md:col-span-2">
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="overflow-x-auto max-h-80">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-2">{u.fullName}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2">
                        <Select
                          value={u.isActive ? "Active" : "Disabled"}
                          onValueChange={async (v) => {
                            try {
                              await axiosPublic.patch(`/admin/manage/user/${u._id}/is-active`, {
                                isActive: v === "Active",
                              });
                              setUsers((prev) =>
                                prev.map((user) =>
                                  user._id === u._id ? { ...user, isActive: v === "Active" } : user
                                )
                              );
                            } catch (err) {
                              console.error("Update user active failed", err);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
