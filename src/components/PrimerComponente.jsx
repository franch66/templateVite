import React ,{useState} from 'react';

export const PrimerComponente = () => {
    //let valor1    = 'dato'
    let valor2    = 'texto'

    const [valor1,setValor1] = useState("dato")
    let acciones = [
        "login",
        "listar",
        "verificar"
    ]

    const cambiarValor = (nuevoValor)=> {
        setValor1 (nuevoValor);
    }
  return (
    <div>
        <h>Componente uno</h>
        <p>texto del componente</p>
        <p>el valor es: <strong className={valor1.length >=4 ? 'verde' : 'rojo' }> {valor1}</strong></p> 
        <p> valor2 es {valor2}</p>

        <input type='text' onChange={e => cambiarValor(e.target.value)} placeholder='cambia el nombre'/>
        <button onClick={ e => cambiarValor("cambio el valor")}>
            cambiar Valor1
        </button> 

        <h2>Acciones</h2>
        <ul>
            {
                acciones.map( (accion,indice) => {
                    return (<li key={indice}>
                        {accion}

                    </li>)
            })
        }
        </ul>

    </div>
  )
}
