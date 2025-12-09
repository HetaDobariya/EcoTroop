import {React,useEffect,useState} from 'react'
import Chart from 'react-apexcharts'
import axios from 'axios'
import Constant from '../../Constant'
import './review.css'

const Review = () => {
    const [months, setMonths] = useState([]);
    const [counts, setCounts] = useState([]);

    useEffect(() => {
        axios.get(Constant.URLs.ApiUrl + '/dashboard/customer-graph')
        .then(res => {
            const data = res.data;
            const allMonths = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ];
              const countMap = {};
              data.forEach(item => {
                countMap[item.month] = item.count;
              });
        
            const labels = allMonths  // ['Feb', 'Mar', 'Apr']
            const values = allMonths.map(month => countMap[month] || 0);  // [2, 1, 2]
           
            setMonths(labels);
            setCounts(values);
          })
          .catch(err => console.error("Failed to fetch customer graph data:", err));
      }, []);

      const chartOptions = {
        chart: {
          type: 'area',
          height: 'auto',
        },
        xaxis: {
          categories: months, // This must be set correctly
          type: 'category',   // This ensures it uses labels, not datetime or numeric
          labels: {
            style: {
              colors: '#000',
            },
          },
        },
        yaxis: {
          show: false,
        },
        stroke: {
          curve: 'smooth',
          colors: ['#22c55e'], // ✅ Tailwind emerald-500 (fresh green)
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100],
            colorStops: [
              {
                offset: 0,
                color: "#bbf7d0", // light green
                opacity: 0.6
              },
              {
                offset: 100,
                color: "#86efac", // slightly deeper green
                opacity: 0.1
              }
            ]
          }
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          show: false,
        },
        tooltip: {
          x: {
            format: 'MMM',
          },
          marker: {
            fillColors: ['#22c55e'], // 💚 your green hover dot
          },
        },
        toolbar: {
          show: false,
        },
        markers: {
          size: 0, // <- Keeps markers hidden by default
          hover: {
            size: 6,
            sizeOffset: 3
          },
          colors: ['#22c55e'],       // <- Green hover dot color
          strokeColors: '#22c55e',   // <- Green border for hover dot
        },
        
        
      };

  return (
    <div className='CustomerReview'>
     <Chart
  series={[{ name: 'Customers', data: counts }]} // <-- pass actual data
  options={chartOptions}                         // <-- options stay the same
  type='area'
/>
    </div>
  )
}

export default Review
