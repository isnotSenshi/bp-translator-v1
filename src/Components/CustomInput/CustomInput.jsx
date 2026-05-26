import React from 'react'

const CustomInput = ({ setUrl }) => {

     return (
          <input placeholder='Ingrese texto' onChange={(e) => setUrl(e?.target?.value)} />
     )
}

export default CustomInput