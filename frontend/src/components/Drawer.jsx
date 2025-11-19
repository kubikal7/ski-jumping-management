import React from 'react';

export default function Drawer({ open, title, children, onClose }) {
  return (
    <>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className='tool-title'>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="btn" onClick={onClose}>Zamknij</button>
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}
