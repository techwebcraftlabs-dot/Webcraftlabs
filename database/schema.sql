CREATE TABLE IF NOT EXISTS agents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hlc_code VARCHAR(100) NULL,
  first_name VARCHAR(150) NULL,
  last_name VARCHAR(150) NULL,
  middle_name VARCHAR(150) NULL,
  role VARCHAR(100) NULL,
  personal_email VARCHAR(255) NULL,
  zonal_email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  password_changed_at DATETIME NULL,
  password_reset_required TINYINT(1) NOT NULL DEFAULT 0,
  mobile_number VARCHAR(50) NULL,
  bdo_account_number VARCHAR(100) NULL,
  facebook_url VARCHAR(500) NULL,
  address TEXT NULL,
  birth_date DATE NULL,
  birth_place VARCHAR(255) NULL,
  civil_status VARCHAR(100) NULL,
  gender VARCHAR(100) NULL,
  recruiter VARCHAR(255) NULL,
  sales_director VARCHAR(255) NULL,
  evp VARCHAR(255) NULL,
  accredited_date DATE NULL,
  locality VARCHAR(100) NULL,
  team VARCHAR(100) NULL,
  sub_team VARCHAR(150) NULL,
  zonal_tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  pass_on_vat TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'For Approval',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY agents_hlc_code_unique (hlc_code),
  UNIQUE KEY agents_zonal_email_unique (zonal_email),
  KEY agents_status_index (status)
);

CREATE TABLE IF NOT EXISTS admin_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
  password_changed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_accounts_email_unique (email)
);

INSERT INTO admin_accounts (email, password_hash, display_name)
VALUES (
  'admin@webcraft.labs',
  '$2b$12$06mkbipnrVCmPmpXupRYdObJCAH.nngotX8lAHtm7my6ncq1ra0nq',
  'Administrator'
)
ON DUPLICATE KEY UPDATE email = VALUES(email);

CREATE TABLE IF NOT EXISTS developers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  developer_name VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  lts VARCHAR(100) NULL,
  developer_rate DECIMAL(8, 2) NOT NULL DEFAULT 0,
  assigned_lsd VARCHAR(255) NULL,
  project_location VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY developers_status_index (status)
);

CREATE TABLE IF NOT EXISTS agent_photos (
  agent_id BIGINT UNSIGNED NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_data LONGBLOB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (agent_id),
  CONSTRAINT agent_photos_agent_id_foreign
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_hash CHAR(64) NOT NULL,
  agent_id BIGINT UNSIGNED NULL,
  admin_account_id BIGINT UNSIGNED NULL,
  role VARCHAR(50) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY auth_sessions_token_hash_unique (token_hash),
  KEY auth_sessions_expires_at_index (expires_at),
  CONSTRAINT auth_sessions_agent_id_foreign
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  CONSTRAINT auth_sessions_admin_account_id_foreign
    FOREIGN KEY (admin_account_id) REFERENCES admin_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login_throttles (
  account_hash CHAR(64) NOT NULL,
  failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  window_started_at DATETIME NOT NULL,
  locked_until DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_hash),
  KEY login_throttles_locked_until_index (locked_until)
);

CREATE TABLE IF NOT EXISTS brs_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS document_sequences (
  sequence_key VARCHAR(50) NOT NULL,
  current_value INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (sequence_key)
);

CREATE TABLE IF NOT EXISTS brs_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  brs_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
  file_size INT UNSIGNED NOT NULL,
  file_data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY brs_attachments_brs_id_index (brs_id),
  CONSTRAINT brs_attachments_brs_id_foreign
    FOREIGN KEY (brs_id) REFERENCES brs_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commission_vouchers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS commission_computations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS property_listings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS property_images (
  property_id BIGINT UNSIGNED NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_data LONGBLOB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (property_id),
  CONSTRAINT property_images_property_id_foreign
    FOREIGN KEY (property_id) REFERENCES property_listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_agent_assignments (
  property_id BIGINT UNSIGNED NOT NULL,
  agent_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (property_id, agent_id),
  KEY property_agent_assignments_agent_index (agent_id),
  CONSTRAINT property_agent_assignments_property_foreign FOREIGN KEY (property_id) REFERENCES property_listings(id) ON DELETE CASCADE,
  CONSTRAINT property_agent_assignments_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  team_name VARCHAR(150) NOT NULL,
  evp_agent_id BIGINT UNSIGNED NULL,
  established_date DATE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY teams_team_name_unique (team_name),
  KEY teams_evp_agent_index (evp_agent_id),
  CONSTRAINT teams_evp_agent_foreign FOREIGN KEY (evp_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS team_subteams (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  team_id BIGINT UNSIGNED NOT NULL,
  subteam_name VARCHAR(150) NOT NULL,
  sd_agent_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY team_subteams_name_unique (team_id, subteam_name),
  CONSTRAINT team_subteams_team_foreign FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT team_subteams_sd_foreign FOREIGN KEY (sd_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS agent_temporary_credentials (
  agent_id BIGINT UNSIGNED NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv CHAR(24) NOT NULL,
  auth_tag CHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (agent_id),
  CONSTRAINT agent_temporary_credentials_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ayuda_loans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, agent_id BIGINT UNSIGNED NOT NULL,
  original_amount DECIMAL(14,2) NOT NULL, installment_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  released_date DATE NOT NULL, notes TEXT NULL, status VARCHAR(30) NOT NULL DEFAULT 'Active',
  created_by BIGINT UNSIGNED NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), CONSTRAINT ayuda_loans_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ayuda_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, loan_id BIGINT UNSIGNED NOT NULL,
  commission_computation_id BIGINT UNSIGNED NULL, amount DECIMAL(14,2) NOT NULL,
  paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id),
  UNIQUE KEY ayuda_payment_computation_unique (loan_id, commission_computation_id),
  CONSTRAINT ayuda_payments_loan_foreign FOREIGN KEY (loan_id) REFERENCES ayuda_loans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  agent_id BIGINT UNSIGNED NOT NULL, event_key VARCHAR(190) NOT NULL,
  type VARCHAR(40) NOT NULL, title VARCHAR(150) NOT NULL, message VARCHAR(500) NOT NULL,
  reference_id VARCHAR(100) NULL, read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY agent_notifications_event_unique (agent_id, event_key),
  KEY agent_notifications_agent_created_index (agent_id, created_at),
  CONSTRAINT agent_notifications_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
