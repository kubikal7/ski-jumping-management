import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: '#fff',
        padding: 20,
        borderRadius: 8,
        maxWidth: 400,
        width: '100%',
        textAlign: 'center'
      }}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className='row' style={{justifyContent: 'center'}}>
          <button className="btn" onClick={onCancel}>Anuluj</button>
          <button className="btn primary" onClick={onConfirm}>Potwierdź</button>
        </div>
      </div>
    </div>
  );
}
