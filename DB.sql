-- ============================================
-- BASE DE DATOS MULTI-TENANT PARA AUTENTICACIÓN
-- Versión: 1.0
-- Motor: MySQL 8.0+
-- ============================================

-- Tabla de usuarios globales (reutilizable entre empresas)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url VARCHAR(500),
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_uuid (uuid),
    INDEX idx_active (is_active),
    INDEX idx_last_login (last_login_at)
);

-- Tabla de planes de suscripción
CREATE TABLE subscription_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL,
    max_companies INT UNSIGNED DEFAULT 1,
    max_branches_per_company INT UNSIGNED DEFAULT NULL, -- NULL = ilimitado
    max_users_per_company INT UNSIGNED DEFAULT NULL,
    max_roles_per_company INT UNSIGNED DEFAULT NULL,
    max_storage_gb INT UNSIGNED DEFAULT NULL,
    features JSON, -- Características adicionales del plan
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- Tabla de empresas/organizaciones
CREATE TABLE companies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2), -- ISO 3166-1 alpha-2
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    subscription_plan_id BIGINT UNSIGNED,
    owner_user_id BIGINT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_starts_at TIMESTAMP NULL,
    subscription_ends_at TIMESTAMP NULL,
    trial_ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_uuid (uuid),
    INDEX idx_owner (owner_user_id),
    INDEX idx_subscription (subscription_plan_id),
    INDEX idx_active (is_active),
    INDEX idx_country (country),
    INDEX idx_subscription_ends (subscription_ends_at)
);

-- Tabla de sedes/sucursales
CREATE TABLE branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    company_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Código interno de la sede
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2),
    postal_code VARCHAR(20),
    timezone VARCHAR(50),
    manager_user_id BIGINT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_uuid (uuid),
    INDEX idx_company (company_id),
    INDEX idx_manager (manager_user_id),
    INDEX idx_active (is_active),
    INDEX idx_code (code),
    UNIQUE KEY unique_company_code (company_id, code)
);

-- Tabla de aplicaciones/módulos del sistema
CREATE TABLE applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    version VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Tabla de permisos del sistema
CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(100), -- Recurso al que aplica (users, products, etc.)
    action VARCHAR(50), -- Acción (create, read, update, delete, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    
    INDEX idx_application (application_id),
    INDEX idx_code (code),
    INDEX idx_resource_action (resource, action),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_app_permission (application_id, code)
);

-- Tabla de roles por empresa
CREATE TABLE company_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- Roles del sistema no editables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_company (company_id),
    INDEX idx_system_role (is_system_role),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_company_role (company_id, name)
);

-- Tabla de permisos asignados a roles
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    INDEX idx_role (role_id),
    INDEX idx_permission (permission_id),
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Tabla de usuarios por empresa (relación many-to-many)
CREATE TABLE company_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    employee_id VARCHAR(50), -- ID de empleado interno
    hire_date DATE,
    termination_date DATE,
    is_internal BOOLEAN DEFAULT FALSE, -- Usuario interno vs externo
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_company (company_id),
    INDEX idx_user (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_internal (is_internal),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_company_user (company_id, user_id)
);

-- Tabla de usuarios por sede
CREATE TABLE branch_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT UNSIGNED NOT NULL,
    company_user_id BIGINT UNSIGNED NOT NULL,
    is_primary_branch BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (company_user_id) REFERENCES company_users(id) ON DELETE CASCADE,
    
    INDEX idx_branch (branch_id),
    INDEX idx_company_user (company_user_id),
    INDEX idx_primary (is_primary_branch),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_branch_company_user (branch_id, company_user_id)
);

-- Tabla de roles asignados a usuarios por empresa
CREATE TABLE user_company_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_user_id) REFERENCES company_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_company_user (company_user_id),
    INDEX idx_role (role_id),
    INDEX idx_assigned_by (assigned_by_user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_user_role (company_user_id, role_id)
);

-- Tabla de tokens de acceso (JWT, API Keys, etc.)
CREATE TABLE user_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED,
    token_type ENUM('access', 'refresh', 'api_key', 'password_reset', 'email_verification') NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100), -- Nombre descriptivo para API keys
    scopes JSON, -- Alcances/permisos del token
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_token_type (token_type),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active),
    INDEX idx_token_hash (token_hash)
);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    location_info JSON,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active),
    INDEX idx_ip (ip_address)
);

-- Tabla de logs de auditoría
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id BIGINT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_company (company_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created (created_at)
);

-- Tabla de configuraciones por empresa
CREATE TABLE company_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSON,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_company (company_id),
    INDEX idx_key (setting_key),
    UNIQUE KEY unique_company_setting (company_id, setting_key)
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar aplicaciones base
INSERT INTO applications (name, code, description, version) VALUES
('Core System', 'core', 'Sistema central de autenticación y administración', '1.0.0'),
('User Management', 'users', 'Módulo de gestión de usuarios', '1.0.0'),
('Company Management', 'companies', 'Módulo de gestión de empresas', '1.0.0');

-- Insertar permisos básicos
INSERT INTO permissions (application_id, name, code, description, resource, action) VALUES
-- Permisos del sistema core
(1, 'View Dashboard', 'core.dashboard.view', 'Ver el dashboard principal', 'dashboard', 'read'),
(1, 'Manage System', 'core.system.manage', 'Administrar configuraciones del sistema', 'system', 'manage'),

-- Permisos de usuarios
(2, 'Create Users', 'users.create', 'Crear nuevos usuarios', 'users', 'create'),
(2, 'View Users', 'users.view', 'Ver listado de usuarios', 'users', 'read'),
(2, 'Edit Users', 'users.edit', 'Editar información de usuarios', 'users', 'update'),
(2, 'Delete Users', 'users.delete', 'Eliminar usuarios', 'users', 'delete'),

-- Permisos de empresas
(3, 'Create Companies', 'companies.create', 'Crear nuevas empresas', 'companies', 'create'),
(3, 'View Companies', 'companies.view', 'Ver listado de empresas', 'companies', 'read'),
(3, 'Edit Companies', 'companies.edit', 'Editar información de empresas', 'companies', 'update'),
(3, 'Delete Companies', 'companies.delete', 'Eliminar empresas', 'companies', 'delete');

-- Insertar planes de suscripción
INSERT INTO subscription_plans (name, description, price, billing_cycle, max_companies, max_branches_per_company, max_users_per_company, max_roles_per_company, features) VALUES
('Free', 'Plan gratuito con funcionalidades básicas', 0.00, 'monthly', 1, 1, 5, 3, '{"support": "community", "storage": "1GB"}'),
('Starter', 'Plan inicial para pequeñas empresas', 29.99, 'monthly', 1, 5, 25, 10, '{"support": "email", "storage": "10GB", "api_access": true}'),
('Professional', 'Plan profesional para empresas en crecimiento', 79.99, 'monthly', 3, 20, 100, 25, '{"support": "priority", "storage": "50GB", "api_access": true, "advanced_reports": true}'),
('Enterprise', 'Plan empresarial sin límites', 199.99, 'monthly', NULL, NULL, NULL, NULL, '{"support": "24/7", "storage": "unlimited", "api_access": true, "advanced_reports": true, "custom_integrations": true}');

-- ============================================
-- TRIGGERS Y PROCEDIMIENTOS
-- ============================================

-- Trigger para generar UUID automáticamente
DELIMITER //

CREATE TRIGGER users_before_insert 
    BEFORE INSERT ON users 
    FOR EACH ROW 
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END//

CREATE TRIGGER companies_before_insert 
    BEFORE INSERT ON companies 
    FOR EACH ROW 
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END//

CREATE TRIGGER branches_before_insert 
    BEFORE INSERT ON branches 
    FOR EACH ROW 
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END//

DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista para obtener usuarios con sus empresas y roles
CREATE VIEW user_company_details AS
SELECT 
    u.id as user_id,
    u.uuid as user_uuid,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    c.id as company_id,
    c.uuid as company_uuid,
    c.name as company_name,
    cu.employee_id,
    cu.is_internal,
    GROUP_CONCAT(cr.name SEPARATOR ', ') as roles
FROM users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN user_company_roles ucr ON cu.id = ucr.company_user_id AND ucr.is_active = TRUE
LEFT JOIN company_roles cr ON ucr.role_id = cr.id AND cr.is_active = TRUE
WHERE u.is_active = TRUE 
AND cu.is_active = TRUE 
AND c.is_active = TRUE
GROUP BY u.id, c.id;

-- Vista para verificar límites de plan
CREATE VIEW company_plan_usage AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    sp.name as plan_name,
    sp.max_branches_per_company,
    sp.max_users_per_company,
    sp.max_roles_per_company,
    COUNT(DISTINCT b.id) as current_branches,
    COUNT(DISTINCT cu.id) as current_users,
    COUNT(DISTINCT cr.id) as current_roles
FROM companies c
LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
LEFT JOIN branches b ON c.id = b.company_id AND b.is_active = TRUE
LEFT JOIN company_users cu ON c.id = cu.company_id AND cu.is_active = TRUE
LEFT JOIN company_roles cr ON c.id = cr.company_id AND cr.is_active = TRUE
WHERE c.is_active = TRUE
GROUP BY c.id;