import React from 'react'

const VillaMap = ({ location, name }) => {
  const [lat, lng] = location ? location.split(',') : ['7.8804', '98.3923']
  
  return (
    <iframe
      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=14`}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  )
}

export default VillaMap