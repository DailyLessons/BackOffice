// filepath: c:\Users\nolan\OneDrive\Bureau\DailyLessons\WebInterface\panelAdmin\src\pages\Settings.tsx
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <div className="settings-content">
        {/* Add your settings options here */}
        <div className="settings-section">
          <h2>User Settings</h2>
          <p>Configure your account settings here.</p>
        </div>
        <div className="settings-section">
          <h2>Application Settings</h2>
          <p>Configure application settings here.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;