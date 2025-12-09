import React from 'react'
import Cards from '../Cards/cards'
import Table from '../Table/table'
import './mainDash.css'


const mainDash = () => {
  return (
    <div className='maindash'>
        <h1>Dashboard</h1>
        <Cards/>
        <Table/>
    </div>
  )
}

export default mainDash
