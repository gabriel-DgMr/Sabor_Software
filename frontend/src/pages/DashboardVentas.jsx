import React from 'react'

import MenuLateral from '../components/MenuLateral';
import '../styles/empleados.css';

const Dashboard = () => {
    return (
        <div className='layout'>
            <MenuLateral />
            <main className='dashboard__ventas'>
                <h1 className='titulos__empleados'>Ventas</h1>
            </main>
        </div>
    )
}

export default Dashboard
