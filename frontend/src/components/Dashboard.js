import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  fetchSalesByCategory,
  fetchMonthlySales,
  fetchProductInventory,
  fetchRecentSales
} from '../services/api';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const Dashboard = () => {
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [productInventory, setProductInventory] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [categoryData, monthlyData, inventoryData, salesData] = await Promise.all([
          fetchSalesByCategory(),
          fetchMonthlySales(),
          fetchProductInventory(),
          fetchRecentSales()
        ]);

        setSalesByCategory(categoryData);
        setMonthlySales(monthlyData);
        setProductInventory(inventoryData);
        setRecentSales(salesData);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchAllData();
  }, []);

  // Prepare data for Category Sales Pie Chart
  const categoryPieData = {
    labels: salesByCategory.map(item => item.category_name),
    datasets: [
      {
        label: 'Sales by Category',
        data: salesByCategory.map(item => item.total_sales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Monthly Sales Bar Chart
  const monthlyBarData = {
    labels: monthlySales.map(item => `${item.month}/${item.year}`),
    datasets: [
      {
        label: 'Monthly Sales ($)',
        data: monthlySales.map(item => item.total_sales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Product Inventory Bar Chart
  const inventoryBarData = {
    labels: productInventory.map(item => item.product_name),
    datasets: [
      {
        label: 'Current Stock',
        data: productInventory.map(item => item.stock_quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare options for charts
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Data Visualization',
      },
    },
  };

  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Sales Dashboard</h1>

      <div className="dashboard-grid">
        <div className="chart-container">
          <h2>Sales by Category</h2>
          <Pie data={categoryPieData} />
        </div>

        <div className="chart-container">
          <h2>Monthly Sales</h2>
          <Bar data={monthlyBarData} options={barOptions} />
        </div>

        <div className="chart-container">
          <h2>Product Inventory</h2>
          <Bar data={inventoryBarData} options={barOptions} />
        </div>
      </div>

      <div className="table-container">
        <h2>Recent Sales</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map(sale => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>${parseFloat(sale.total_price).toFixed(2)}</td>
                <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
