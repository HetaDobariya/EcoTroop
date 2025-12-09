import React from 'react'
import './right.css'
import Updates from '../Updates/update'
import CustomerReview from '../Customer Review/review'
const right = () => {
  return (
    <div className='RightSide'>
        <div>
            <h3>Updates</h3>
            <Updates/>

        </div>
        <div>
            <h3>Customers</h3>
            <CustomerReview/>
        </div>
    </div>
  )
}

export default right
