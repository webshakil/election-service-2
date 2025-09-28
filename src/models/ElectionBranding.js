import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ElectionBranding = sequelize.define('vottery_election_branding_2', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'vottery_election_2',
      key: 'id'
    }
  },
  
  // Logo and Images
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  logo_position: {
    type: DataTypes.ENUM('top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'),
    defaultValue: 'top-center'
  },
  
  logo_size: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    defaultValue: 'medium'
  },
  
  favicon_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  background_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Color Scheme
  primary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#007bff'
  },
  
  secondary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6c757d'
  },
  
  accent_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#28a745'
  },
  
  background_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff'
  },
  
  text_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#212529'
  },
  
  button_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#007bff'
  },
  
  button_text_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff'
  },
  
  // Typography
  font_family: {
    type: DataTypes.STRING(100),
    defaultValue: 'Inter, system-ui, sans-serif'
  },
  
  heading_font: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  body_font: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  font_size: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    defaultValue: 'medium'
  },
  
  // Corporate Style
  corporate_style_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  white_label_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  hide_vottery_branding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Custom CSS
  custom_css: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  custom_javascript: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Theme Settings
  theme: {
    type: DataTypes.ENUM('light', 'dark', 'auto'),
    defaultValue: 'light'
  },
  
  border_radius: {
    type: DataTypes.INTEGER,
    defaultValue: 8
  },
  
  shadow_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  animations_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Content Creator Integration Branding
  content_creator_branding: {
    type: DataTypes.JSONB,
    defaultValue: {
      enabled: false,
      creator_name: '',
      creator_logo_url: '',
      creator_colors: {
        primary: '#007bff',
        secondary: '#6c757d'
      },
      integration_style: 'embedded'
    }
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  // Timestamps
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vottery_election_branding_2',
  timestamps: true,
  indexes: [
    {
      fields: ['election_id'],
      unique: true
    }
  ],
  hooks: {
    beforeUpdate: (branding) => {
      branding.updated_at = new Date();
    }
  }
});

// Instance methods
ElectionBranding.prototype.getCSSVariables = function() {
  return {
    '--primary-color': this.primary_color,
    '--secondary-color': this.secondary_color,
    '--accent-color': this.accent_color,
    '--background-color': this.background_color,
    '--text-color': this.text_color,
    '--button-color': this.button_color,
    '--button-text-color': this.button_text_color,
    '--font-family': this.font_family,
    '--border-radius': `${this.border_radius}px`
  };
};

export default ElectionBranding;