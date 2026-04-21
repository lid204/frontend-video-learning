import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import API_BASE_URL from '../../config/api';

const BASE_URL = API_BASE_URL;

// ====== MOCK DATA (fallback khi API chưa có data) ======
const MOCK_OVERVIEW = {
  total_revenue: 48500000,
  revenue_this_month: 12750000,
  total_users: 342,
  new_users_this_month: 28,
  total_courses: 15,
  total_enrollments: 891,
};

const MOCK_REVENUE_MONTHLY = [
  { label: '2025-07', revenue: 8200000, orders: 21 },
  { label: '2025-08', revenue: 11500000, orders: 30 },
  { label: '2025-09', revenue: 9800000, orders: 26 },
  { label: '2025-10', revenue: 14200000, orders: 38 },
  { label: '2025-11', revenue: 16700000, orders: 44 },
  { label: '2025-12', revenue: 22100000, orders: 58 },
  { label: '2026-01', revenue: 18900000, orders: 50 },
  { label: '2026-02', revenue: 21300000, orders: 56 },
  { label: '2026-03', revenue: 19500000, orders: 52 },
  { label: '2026-04', revenue: 12750000, orders: 34 },
];

const MOCK_REVENUE_DAILY = [
  { label: '01/04', revenue: 1200000, orders: 3 },
  { label: '02/04', revenue: 800000, orders: 2 },
  { label: '03/04', revenue: 2400000, orders: 6 },
  { label: '04/04', revenue: 1600000, orders: 4 },
  { label: '05/04', revenue: 3200000, orders: 8 },
  { label: '06/04', revenue: 1800000, orders: 5 },
  { label: '07/04', revenue: 1750000, orders: 6 },
];

const MOCK_TOP_COURSES = [
  { id: 1, title: 'ReactJS Toàn Tập 2026', student_count: 187, avg_rating: 4.8, price: 499000 },
  { id: 2, title: 'Node.js & Express API', student_count: 142, avg_rating: 4.6, price: 399000 },
  { id: 3, title: 'UI/UX Design với Figma', student_count: 115, avg_rating: 4.7, price: 349000 },
  { id: 4, title: 'Python Machine Learning', student_count: 98, avg_rating: 4.5, price: 599000 },
  { id: 5, title: 'Docker & Kubernetes', student_count: 76, avg_rating: 4.4, price: 449000 },
];

const MOCK_COMPLETION = {
  overall: {
    avg_completion: 64.3,
    completed_count: 234,
    in_progress_count: 412,
    not_started_count: 245,
    total_enrollments: 891,
  },
  by_course: [
    { course_title: 'ReactJS Toàn Tập 2026', avg_completion: 82, total_students: 187 },
    { course_title: 'UI/UX Design với Figma', avg_completion: 74, total_students: 115 },
    { course_title: 'Node.js & Express API', avg_completion: 67, total_students: 142 },
    { course_title: 'Python Machine Learning', avg_completion: 53, total_students: 98 },
    { course_title: 'Docker & Kubernetes', avg_completion: 41, total_students: 76 },
  ]
};

// ====== PALETTE & TOKEN ======
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  cyan: '#06b6d4',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
};

const BAR_COLORS = [COLORS.primary, COLORS.secondary, COLORS.emerald, COLORS.amber, COLORS.rose];
const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

// ====== FORMAT HELPERS ======
const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatNum = (val) =>
  new Intl.NumberFormat('vi-VN').format(val || 0);

// ====== CUSTOM TOOLTIP ======
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.97)',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: COLORS.slate400, fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: '14px', margin: '3px 0' }}>
            {p.name}: {p.name === 'Doanh thu' ? formatCurrency(p.value) : formatNum(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ====== STAT CARD ======
const StatCard = ({ icon, label, value, subValue, subLabel, color, trend, loading }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
        border: `1px solid ${hovered ? color + '55' : color + '22'}`,
        borderRadius: '20px',
        padding: '26px',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px ${color}20` : '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      {/* Glow BG */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        opacity: hovered ? 1 : 0.6,
      }} />
      {/* Shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '14px',
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', flexShrink: 0,
          boxShadow: `0 0 20px ${color}15`,
        }}>{icon}</div>
        <span style={{ color: COLORS.slate400, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1.3 }}>{label}</span>
      </div>

      {loading ? (
        <div style={{ height: '42px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
      ) : (
        <>
          <div style={{ fontSize: '30px', fontWeight: '800', color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>{value}</div>
          {subValue !== undefined && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: COLORS.slate400, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                color: trend === 'down' ? COLORS.rose : COLORS.emerald,
                fontWeight: 700,
                background: trend === 'down' ? `${COLORS.rose}15` : `${COLORS.emerald}15`,
                padding: '2px 8px', borderRadius: '20px',
                fontSize: '12px',
              }}>
                {trend === 'down' ? '↓' : '↑'} {subValue}
              </span>
              <span>{subLabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ====== SECTION HEADER ======
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: '22px' }}>
    <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{
        width: '38px', height: '38px', borderRadius: '11px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
        boxShadow: '0 6px 15px rgba(99,102,241,0.35)',
        flexShrink: 0,
      }}>{icon}</span>
      {title}
    </h3>
    {subtitle && <p style={{ color: COLORS.slate400, fontSize: '12px', margin: '6px 0 0 50px', lineHeight: 1.5 }}>{subtitle}</p>}
  </div>
);

// ====== CHART CARD ======
const ChartCard = ({ children, style = {} }) => (
  <div style={{
    background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
    border: '1px solid rgba(99,102,241,0.12)',
    borderRadius: '22px',
    padding: '28px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.25)',
    ...style,
  }}>
    {children}
  </div>
);

// ====== SKELETON ======
const Skeleton = ({ height = 300 }) => (
  <div style={{
    height,
    borderRadius: '12px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.8s infinite',
  }} />
);

// ====== BADGE ======
const Badge = ({ children, color }) => (
  <span style={{
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}30`,
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '700',
  }}>{children}</span>
);

// ====== MAIN DASHBOARD ======
export default function AdminDashboard() {
  const [period, setPeriod] = useState('monthly');
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState({ overview: true, revenue: true, topCourses: true, completion: true });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [usingMock, setUsingMock] = useState(false);
  const [activeMetric, setActiveMetric] = useState('revenue');

  const fetchAll = async () => {
    setLoading({ overview: true, revenue: true, topCourses: true, completion: true });
    setUsingMock(false);

    let failed = false;

    try {
      const [ovRes, rvRes, tcRes, cpRes] = await Promise.all([
        axios.get(`${BASE_URL}/stats/overview`).catch(() => null),
        axios.get(`${BASE_URL}/stats/revenue?period=${period}`).catch(() => null),
        axios.get(`${BASE_URL}/stats/top-courses`).catch(() => null),
        axios.get(`${BASE_URL}/stats/completion-rate`).catch(() => null),
      ]);

      // Overview
      if (ovRes?.data) {
        setOverview(ovRes.data);
      } else {
        setOverview(MOCK_OVERVIEW);
        failed = true;
      }

      // Revenue
      if (rvRes?.data && rvRes.data.length > 0) {
        setRevenue(rvRes.data);
      } else {
        setRevenue(period === 'daily' ? MOCK_REVENUE_DAILY : MOCK_REVENUE_MONTHLY);
        failed = true;
      }

      // Top Courses
      if (tcRes?.data && tcRes.data.length > 0) {
        setTopCourses(tcRes.data);
      } else {
        setTopCourses(MOCK_TOP_COURSES);
        failed = true;
      }

      // Completion
      if (cpRes?.data && parseInt(cpRes.data.overall?.total_enrollments) > 0) {
        setCompletion(cpRes.data);
      } else {
        setCompletion(MOCK_COMPLETION);
        failed = true;
      }

      if (failed) setUsingMock(true);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setOverview(MOCK_OVERVIEW);
      setRevenue(period === 'daily' ? MOCK_REVENUE_DAILY : MOCK_REVENUE_MONTHLY);
      setTopCourses(MOCK_TOP_COURSES);
      setCompletion(MOCK_COMPLETION);
      setUsingMock(true);
    } finally {
      setLoading({ overview: false, revenue: false, topCourses: false, completion: false });
    }
  };

  useEffect(() => { fetchAll(); }, [period]);

  // Pie data
  const pieData = completion ? [
    { name: 'Hoàn thành', value: parseInt(completion.overall.completed_count) },
    { name: 'Đang học', value: parseInt(completion.overall.in_progress_count) },
    { name: 'Chưa bắt đầu', value: parseInt(completion.overall.not_started_count) },
  ] : [];

  // Radial data for completion gauge
  const avgCompletion = completion ? parseFloat(completion.overall.avg_completion) : 0;
  const radialData = [{ name: 'Hoàn thành', value: avgCompletion, fill: COLORS.primary }];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0f1e 0%, #0f172a 40%, #1a0a2e 80%, #0a0f1e 100%)',
      padding: '30px',
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes shimmer {
          0% { background-position: -400% 0; }
          100% { background-position: 400% 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .dash-section { animation: fadeInUp 0.5s ease forwards; }
        .dash-section:nth-child(2) { animation-delay: 0.1s; }
        .dash-section:nth-child(3) { animation-delay: 0.2s; }
        .dash-section:nth-child(4) { animation-delay: 0.3s; }
        .recharts-tooltip-wrapper { z-index: 999 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 4px; }
      `}</style>

      {/* Background decorations */}
      <div style={{
        position: 'fixed', top: '10%', left: '5%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '5%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ===== HEADER ===== */}
        <div className="dash-section" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '32px',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '15px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 8px 25px rgba(99,102,241,0.5)',
                animation: 'pulse-glow 3s ease infinite',
              }}>📊</div>
              <div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                  Admin Dashboard
                </h1>
                <p style={{ color: COLORS.slate400, fontSize: '13px', margin: 0 }}>
                  Tổng quan tình hình học tập & kinh doanh real-time
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {usingMock && (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '10px', padding: '7px 12px',
                color: COLORS.amber, fontSize: '12px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                ⚠️ Đang hiển thị dữ liệu mẫu
              </div>
            )}
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
              borderRadius: '10px', padding: '7px 13px', color: COLORS.slate400, fontSize: '12px',
            }}>
              🕐 {lastRefresh.toLocaleTimeString('vi-VN')}
            </div>
            <button
              onClick={fetchAll}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '10px', padding: '9px 18px',
                color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.4)'; }}
            >
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* ===== KPI STAT CARDS ===== */}
        <div className="dash-section" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '18px', marginBottom: '28px',
        }}>
          <StatCard
            icon="💰" label="Tổng Doanh Thu"
            value={loading.overview ? '...' : formatCurrency(overview?.total_revenue)}
            subValue={loading.overview ? '' : formatCurrency(overview?.revenue_this_month)}
            subLabel="tháng này"
            color={COLORS.emerald}
            loading={loading.overview}
          />
          <StatCard
            icon="👥" label="Tổng Người Dùng"
            value={loading.overview ? '...' : formatNum(overview?.total_users)}
            subValue={loading.overview ? '' : (overview?.new_users_this_month !== undefined ? `+${overview.new_users_this_month}` : undefined)}
            subLabel="user mới tháng này"
            color={COLORS.primary}
            loading={loading.overview}
          />
          <StatCard
            icon="📚" label="Tổng Khóa Học"
            value={loading.overview ? '...' : formatNum(overview?.total_courses)}
            color={COLORS.amber}
            loading={loading.overview}
          />
          <StatCard
            icon="🎓" label="Lượt Ghi Danh"
            value={loading.overview ? '...' : formatNum(overview?.total_enrollments)}
            color={COLORS.sky}
            loading={loading.overview}
          />
        </div>

        {/* ===== REVENUE CHART ===== */}
        <ChartCard style={{ marginBottom: '24px' }} className="dash-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <SectionHeader icon="📈" title="Biểu Đồ Doanh Thu" subtitle={`Thống kê ${period === 'monthly' ? '10 tháng gần nhất' : '7 ngày gần nhất'} (doanh thu = số ghi danh × giá khóa học)`} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'monthly', label: '📅 Theo tháng' },
                { key: 'daily', label: '📆 Theo ngày' },
              ].map(({ key, label }) => (
                <button key={key}
                  onClick={() => setPeriod(key)}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                    background: period === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                    color: period === key ? 'white' : COLORS.slate400,
                    boxShadow: period === key ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
                    transform: period === key ? 'scale(1.02)' : 'scale(1)',
                  }}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Metric toggle */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            {[
              { key: 'revenue', label: '💰 Doanh thu', color: COLORS.primary },
              { key: 'orders', label: '📦 Lượt đăng ký', color: COLORS.emerald },
              { key: 'both', label: '📊 Cả hai', color: COLORS.amber },
            ].map(({ key, label, color }) => (
              <button key={key}
                onClick={() => setActiveMetric(key)}
                style={{
                  padding: '5px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${activeMetric === key ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: activeMetric === key ? `${color}18` : 'transparent',
                  color: activeMetric === key ? color : COLORS.slate400,
                }}
              >{label}</button>
            ))}
          </div>

          {loading.revenue ? <Skeleton height={280} /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: COLORS.slate400, fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: COLORS.slate400, fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v}
                  hide={activeMetric === 'orders'}
                />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.slate400, fontSize: 10 }} axisLine={false} tickLine={false}
                  hide={activeMetric !== 'both'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: COLORS.slate400, fontSize: '12px', paddingTop: '12px' }} />
                {(activeMetric === 'revenue' || activeMetric === 'both') && (
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu"
                    stroke={COLORS.primary} strokeWidth={2.5} fill="url(#gradRevenue)"
                    dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 7, fill: COLORS.primary, stroke: 'white', strokeWidth: 2 }} />
                )}
                {(activeMetric === 'orders' || activeMetric === 'both') && (
                  <Area yAxisId={activeMetric === 'both' ? 'right' : 'left'} type="monotone" dataKey="orders" name="Lượt đăng ký"
                    stroke={COLORS.emerald} strokeWidth={2.5} fill="url(#gradOrders)"
                    dot={{ fill: COLORS.emerald, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 7, fill: COLORS.emerald, stroke: 'white', strokeWidth: 2 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ===== ROW 2: TOP COURSES + COMPLETION ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>

          {/* TOP 5 COURSES */}
          <ChartCard>
            <SectionHeader icon="🏆" title="Top 5 Khóa Học Phổ Biến" subtitle="Xếp theo số học viên đăng ký" />
            {loading.topCourses ? <Skeleton height={340} /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={topCourses} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="title" tick={false} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                    <YAxis tick={{ fill: COLORS.slate400, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '14px', padding: '12px 16px' }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginBottom: '8px', maxWidth: '180px' }}>{d.title}</p>
                            <p style={{ color: COLORS.sky, fontSize: '12px', margin: '3px 0' }}>👥 {d.student_count} học viên</p>
                            <p style={{ color: COLORS.amber, fontSize: '12px', margin: '3px 0' }}>⭐ {parseFloat(d.avg_rating).toFixed(1)} sao</p>
                            <p style={{ color: COLORS.emerald, fontSize: '12px', margin: '3px 0' }}>💰 {formatCurrency(d.price)}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="student_count" name="Học viên" radius={[6, 6, 0, 0]}>
                      {topCourses.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {topCourses.map((c, i) => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '12px',
                      background: i === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)'; }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: `${BAR_COLORS[i]}25`,
                        color: BAR_COLORS[i],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '12px', flexShrink: 0,
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                        <div style={{ color: COLORS.slate400, fontSize: '11px', marginTop: '2px' }}>
                          👥 {c.student_count} học viên &nbsp;|&nbsp; ⭐ {parseFloat(c.avg_rating).toFixed(1)}
                        </div>
                      </div>
                      <Badge color={COLORS.emerald}>{formatCurrency(c.price)}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>

          {/* COMPLETION RATE */}
          <ChartCard>
            <SectionHeader icon="✅" title="Tỉ Lệ Hoàn Thành" subtitle="Dựa trên progress_percent của học viên trong hệ thống" />
            {loading.completion ? <Skeleton height={340} /> : (
              completion && completion.overall.total_enrollments > 0 ? (
                <>
                  {/* Gauge + Pie row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    {/* Radial gauge */}
                    <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
                      <ResponsiveContainer width={150} height={150}>
                        <RadialBarChart
                          innerRadius="70%" outerRadius="100%"
                          data={[{ value: 100, fill: 'rgba(255,255,255,0.06)' }, ...radialData]}
                          startAngle={225} endAngle={-45}
                        >
                          <RadialBar dataKey="value" cornerRadius={6} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: '26px', fontWeight: '900',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>{avgCompletion.toFixed(0)}%</div>
                        <div style={{ color: COLORS.slate400, fontSize: '10px', marginTop: '2px' }}>Trung bình</div>
                      </div>
                    </div>

                    {/* Pie */}
                    <div style={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={pieData.filter(d => d.value > 0)}
                            dataKey="value" cx="50%" cy="50%"
                            innerRadius={42} outerRadius={65} paddingAngle={3}
                          >
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip formatter={(val, name) => [val, name]}
                            contentStyle={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Legend stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { label: 'Đã hoàn thành (100%)', value: completion.overall.completed_count, color: PIE_COLORS[0], pct: Math.round(completion.overall.completed_count / completion.overall.total_enrollments * 100) },
                      { label: 'Đang học (>0%)', value: completion.overall.in_progress_count, color: PIE_COLORS[1], pct: Math.round(completion.overall.in_progress_count / completion.overall.total_enrollments * 100) },
                      { label: 'Chưa bắt đầu (0%)', value: completion.overall.not_started_count, color: PIE_COLORS[2], pct: Math.round(completion.overall.not_started_count / completion.overall.total_enrollments * 100) },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <span style={{ color: COLORS.slate400, fontSize: '12px', flex: 1 }}>{item.label}</span>
                        <Badge color={item.color}>{item.pct}%</Badge>
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '14px', minWidth: '32px', textAlign: 'right' }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS.slate600, flexShrink: 0 }} />
                      <span style={{ color: COLORS.slate400, fontSize: '12px', flex: 1 }}>Tổng lượt ghi danh</span>
                      <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{completion.overall.total_enrollments}</span>
                    </div>
                  </div>

                  {/* By course progress bars */}
                  {completion.by_course.length > 0 && (
                    <div>
                      <div style={{ color: COLORS.slate400, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        Top khóa học theo tỉ lệ hoàn thành
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {completion.by_course.map((c, i) => {
                          const pct = parseFloat(c.avg_completion);
                          const barColor = pct >= 70 ? COLORS.emerald : pct >= 40 ? COLORS.amber : COLORS.rose;
                          return (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                                <span style={{ color: COLORS.slate200, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                  {c.course_title}
                                </span>
                                <span style={{ color: barColor, fontSize: '12px', fontWeight: '700', marginLeft: '8px' }}>{pct.toFixed(0)}%</span>
                              </div>
                              <div style={{ height: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                                  borderRadius: '6px',
                                  transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.slate400, flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '48px' }}>📊</div>
                  <div>Chưa có dữ liệu tiến độ học viên</div>
                </div>
              )
            )}
          </ChartCard>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={{
          textAlign: 'center', color: COLORS.slate600, fontSize: '12px',
          padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ animation: 'float 3s ease infinite', display: 'inline-block' }}>⚡</span>
          Dashboard Admin — Dữ liệu được tải trực tiếp từ database. Chỉ đọc, không ảnh hưởng hệ thống.
          {usingMock && <span style={{ color: COLORS.amber }}> | Hiển thị dữ liệu demo</span>}
        </div>
      </div>
    </div>
  );
}
