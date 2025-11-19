import React, { useState } from 'react';

export default function PlayerAvatar({ photoUrl }) {
  const [imageError, setImageError] = useState(false);

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt="zawodnik"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );
}