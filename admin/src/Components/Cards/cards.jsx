import {React,useState,useEffect} from 'react'
import Card from '../Card/card'
import './cards.css';
import { CardsData } from '../../Data/data';
import axios from 'axios';
import Constant from '../../Constant';

const Cards = () => {
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPayment, settotalPayment] = useState(0);

  useEffect(() => {
    axios.get(Constant.URLs.ApiUrl + '/dashboard/accepted-count')
    .then(res => setAcceptedCount(res.data.latestAcceptedId))
      .catch(err => console.error('Failed to fetch accepted count:', err));

      axios.get(Constant.URLs.ApiUrl + '/dashboard/total-weight')
      .then(res => setTotalWeight(res.data.totalWeight))
      .catch(err => console.error('Failed to fetch total weight:', err));

      axios.get(Constant.URLs.ApiUrl + '/dashboard/total-payment')
      .then(res => settotalPayment(res.data.totalPayment))
      .catch(err => console.error('Failed to fetch total weight:', err));
  }, []);

  return (
    <div className='cards'>
      {CardsData.map ((card,id)=> {
        let value = card.value;
        let barValue = card.barValue;

       if ( id === 0) {
        value = acceptedCount ? acceptedCount.toString() + ' Order' : "0"
        barValue = acceptedCount ? ((acceptedCount / 500) * 100).toFixed(2) : 0;
      };
        if (id === 1) {
          value = totalWeight ? totalWeight.toString() + ' KG' : "0"
          barValue = totalWeight ? ((totalWeight / 500) * 100).toFixed(2) : 0;
        };
        if (id === 2) {
          value = totalPayment ? totalPayment.toString() + ' RS' : "0";
          barValue = totalPayment ? ((totalPayment / 10000) * 100).toFixed(2) : 0;
        }
        return(
            <div className='parentContainer' key={id}>
                <Card
                title={card.title}
                color={card.color}
                barValue= {barValue}
                value={value}
           
                />
            </div>  
        )
      })}
    </div>
  )
}

export default Cards
