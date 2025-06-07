import React, { useState } from "react";

import MenuLateral from '../components/MenuLateral';
import '../styles/empleados.css';

const ReservacionesAdministrar = () => {
    const [filtroHora] = useState("todos");

    const datos = [
        { nombre: "Felipez Velasquez", mesa: 21, hora: "18:00" },
        { nombre: "Miguel Sanchez", mesa: 12, hora: "18:15" },
        { nombre: "Gabriel Durango", mesa: 18, hora: "18:20" },
        { nombre: "Camila Pineda", mesa: 5, hora: "18:30" },
        { nombre: "Sebastian Montenegro", mesa: 29, hora: "18:45" },
        { nombre: "Miguel Morales", mesa: 26, hora: "18:45" },
        { nombre: "Felipez Velasquez", mesa: 21, hora: "19:00" },
        { nombre: "Miguel Sanchez", mesa: 12, hora: "19:15" },
        { nombre: "Gabriel Durango", mesa: 18, hora: "19:20" },
        { nombre: "Camila Pineda", mesa: 5, hora: "19:30" },
        { nombre: "Miguel Coterio", mesa: 29, hora: "19:45" },
        { nombre: "Adriana Arrieta", mesa: 26, hora: "19:45" },
        { nombre: "Johnny Perez", mesa: 21, hora: "20:00" },
        { nombre: "Miguel Sanchez", mesa: 12, hora: "20:15" },
        { nombre: "Gabriel Durango", mesa: 18, hora: "20:20" },
        { nombre: "Camila Pineda", mesa: 5, hora: "20:30" },
        { nombre: "Sebastian Montenegro", mesa: 29, hora: "20:45" },
        { nombre: "Adriana Arrieta", mesa: 26, hora: "20:45" },
    ];

    const bloques = [
        { titulo: "RESERVACIONES DE 6:00 PM - 7:00 PM", inicio: 18, fin: 19 },
        { titulo: "RESERVACIONES DE 7:00 PM - 8:00 PM", inicio: 19, fin: 20 },
        { titulo: "RESERVACIONES DE 8:00 PM - 9:00 PM", inicio: 20, fin: 21 },
    ];

    const reservasFiltradas = (inicio, fin) => {
        return datos.filter((r) => {
            const hora = parseInt(r.hora.split(":")[0]);
            if (filtroHora === "todos") return hora >= inicio && hora < fin;
            return parseInt(filtroHora) === hora;
        });
    };

    return (
        <div className="layout">
            <MenuLateral />
        <main className="reservaciones">
                <h1 className="titulos__empleados">RESERVACIONES</h1>
            <div className="reservaciones__filtrar">
                <button className="reservaciones__boton-filtrar">FILTRAR</button>
            </div>
            <section className="reservaciones__bloques">
                {bloques.map((bloque, i) => (
                    <div key={i} className="reservaciones__bloque">
                        <h2 className="reservaciones__bloque-titulo">{bloque.titulo}</h2>
                        <div className="reservaciones__lista">
                            {reservasFiltradas(bloque.inicio, bloque.fin).map((res, idx) => (
                                <div className="reservacion" key={idx}>
                                    <p className="reservacion__nombre">
                                        <strong>Nombre:</strong> {res.nombre}
                                    </p>
                                    <p className="reservacion__mesa">
                                        <strong>MESA:</strong> {res.mesa}
                                    </p>
                                    <p className="reservacion__hora">{res.hora}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </main>
        </div>
    );
};

export default ReservacionesAdministrar;
