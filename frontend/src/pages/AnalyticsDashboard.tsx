import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { initializeContract } from '../types/contract';
import { MetricCard } from '../components/MetricCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


interface MarketStats {
  totalVolume: number;
  totalSales: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  averagePrice: number;
  floorPrice: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalVolume: 0,
    totalSales: 0,
    uniqueBuyers: 0,
    uniqueSellers: 0,
    averagePrice: 0,
    floorPrice: 0,
  });

  const [categoryVolumes, setCategoryVolumes] = useState<Record<string, number>>({});

  const fetchAllData = async () => {
    try {
      if (!window.marketplaceContract) {
        await initializeContract();
      }
      const [totalVolume, totalSales, uniqueBuyers, uniqueSellers] =
        await window.marketplaceContract.get_market_stats();

      const averagePrice = totalSales > 0 ? totalVolume / totalSales : 0;

      setMarketStats({
        totalVolume: Number(totalVolume),
        totalSales: Number(totalSales),
        uniqueBuyers: Number(uniqueBuyers),
        uniqueSellers: Number(uniqueSellers),
        averagePrice,
        floorPrice: 0,
      });

      const categoryMapping: Record<string, number> = {
        common: 1,
        rare: 2,
        epic: 3,
      };
  
      const categories = Object.keys(categoryMapping);
      const categoryData: Record<string, number> = {};
      for (const category of categories) {
        const rarityValue = categoryMapping[category];
        const volume = await window.marketplaceContract.get_rarity_volume(rarityValue);
        console.log(`Rarity ${category} volume:`, Number(volume));
        categoryData[category] = Number(volume);
      }
      setCategoryVolumes(categoryData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Card styling
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a1a1a' }}>
          Marketplace Analytics
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Real-time insights into marketplace performance
        </p>
      </div>
  
      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* First Row */}
        <div style={cardStyle}>
          <MetricCard
            title="Total Volume"
            icon="📈"
            value={`${marketStats.totalVolume.toLocaleString()} APT`}
          />
        </div>
        <div style={cardStyle}>
          <MetricCard
            title="Average Price"
            icon="💰"
            value={`${marketStats.averagePrice.toLocaleString()} APT`}
          />
        </div>
        <div style={cardStyle}>
          <MetricCard
            title="Floor Price"
            icon="🏷"
            value={`${marketStats.floorPrice.toLocaleString()} APT`}
          />
        </div>
  
        {/* Second Row */}
        <div style={cardStyle}>
          <MetricCard
            title="Total Sales"
            icon="🛍"
            value={marketStats.totalSales.toLocaleString()}
          />
        </div>
        <div style={cardStyle}>
          <MetricCard
            title="Unique Buyers"
            icon="👥"
            value={marketStats.uniqueBuyers.toLocaleString()}
          />
        </div>
        <div style={cardStyle}>
          <MetricCard
            title="Unique Sellers"
            icon="🤝"
            value={marketStats.uniqueSellers.toLocaleString()}
          />
        </div>
      </div>
  
      {/* Chart Section */}
      <div style={{ 
        ...cardStyle, 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '30px'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Category Distribution
        </h3>
        <div style={{ height: '400px' }}>
          <Pie
            data={{
              labels: Object.keys(categoryVolumes),
              datasets: [{
                data: Object.values(categoryVolumes),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderWidth: 1,
                hoverOffset: 4,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};  

export default AnalyticsDashboard;
