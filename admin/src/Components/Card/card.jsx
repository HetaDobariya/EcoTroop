import React, { useState,useEffect } from 'react'
import {motion,LayoutGroup } from 'framer-motion'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './card.css'
import {UilTimes} from '@iconscout/react-unicons'
import Chart from "react-apexcharts";
import axios from 'axios';
import Constant from '../../Constant';


const Card = (props) => {

    const [expanded,setExpanded] = useState(false);

 

  return (
    <LayoutGroup>
        {expanded? (
                <ExpandedCard param={props} setExpanded={()=> setExpanded(false)}/>
            ):(
            <CompactCard param = {props} setExpanded={()=> setExpanded(true)}/>)
        }
    </LayoutGroup>
  )
}


function CompactCard ({param,setExpanded})
{
    return (
        <motion.div className='CompactCard'
        style={{
            background : param.color.backGround,
            boxshadow : param.color.boxShadow
        }}
        onClick={setExpanded}
        layoutId={`card-${param.title}`}
        >
            <div className='radialBar'>
                <CircularProgressbar
                value= {param.barValue}
                text={`${param.barValue}%`}/>
                <span>{param.title}</span>
            </div>

            <div className='detail'>
                <span>{param.value}</span>
            </div>
        </motion.div>
    )
}

const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


function ExpandedCard({param,setExpanded}) {
 
  const [monthCounts, setMonthCounts] = useState([]);

  
useEffect(() => {
  let endpoint = '';
  let key = '';

  if (param.title === 'Accepted') {
    endpoint = '/dashboard/monthly-accepted';     
    key = 'count';
  } else if (param.title === 'E-Waste') {
    endpoint = '/dashboard/monthly-weight';     
    key = 'total_weight';
  } else if (param.title === 'Expenses') {
    endpoint = '/dashboard/monthly-payment';
    key = 'total_payment';
  }


  if (endpoint) {
    axios.get(Constant.URLs.ApiUrl + endpoint)
      .then(res => {
        const countMap = {};
        res.data.forEach(item => {
          countMap[item.month] = item[key];
        });

        const counts = allMonths.map(month => countMap[month] || 0);
        setMonthCounts(counts);
      })
      .catch(err => console.error(`Failed to fetch ${param.title} data:`, err));
  }
}, [param.title]);

  


  const chartOptions = {
    chart: {
      type: 'area',
      height: 'auto',
    },
    fill: {
      colors: ['#fff'],
      type: 'gradient',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      colors: ['white'],
    },
    tooltip: {
      x: {
        format: 'MMM',
      },
    },
    grid: {
      show: false,
    },
    xaxis: {
      type: 'category',
      categories: allMonths,
    },
    yaxis: {
      show: false,
    },
    toolbar: {
      show: false,
    },
  };

   

    return (
        <motion.div
      className='ExpandedCard'
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layoutId={`card-${param.title}`}
    >
      <div style={{ alignSelf: 'flex-end', cursor: 'pointer', color: 'white' }}>
        <UilTimes onClick={setExpanded} />
      </div>
      <span>{param.title}</span>

      <div className='chartContainer'>
  <Chart
    series={[{ name: param.title, data: monthCounts }]}
    type='area'
    options={{
      ...chartOptions,
      xaxis: {
        ...chartOptions.xaxis,
        categories: allMonths,
      },
    }}
  />
</div>

    </motion.div>
    )
}

export default Card;
