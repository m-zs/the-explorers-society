# Users Module

The Users module manages user accounts, authentication, and authorization within the system. It handles user creation, management, and their relationships with tenants and roles.

## 🚀 Features

### Core Features

- User CRUD operations with role-based access control
- User-tenant relationship management
- User-role assignment and management
- Secure password hashing and verification
- User profile management
- Secure password change functionality
- Role-based access control (RBAC)

## 🔐 Authentication & Authorization

- All endpoints are protected by `AuthGuard`
- Role-based access control using `AppRole` enum
- Custom `CheckUserAccess` decorator for resource-level authorization
- Support for ADMIN and SUPPORT roles with elevated privileges

## 📚 API Documentation

### User Management

- `POST /users` - Create a new user
- `GET /users` - List all users
- `GET /users/:id` - Get a specific user
- `PUT /users/:id` - Update a user
- `PUT /users/:id/password` - Change user password
- `DELETE /users/:id` - Delete a user

### User Relationships

- `GET /users/:id/tenants` - Get user with their tenants
- `GET /users/:id/roles` - Get user with their roles
- `GET /users/:id/tenants-and-roles` - Get user with both tenants and roles

## 📦 Data Models

### CreateUserDto

- `name`: string - User's full name (required)
- `email`: string - User's email address (required, must be valid email)
- `password`: string - User's password (required)
- `tenantId`: number - Associated tenant ID (optional)

### UpdateUserDto

- `name`: string - User's full name (optional)
- `email`: string - User's email address (optional, must be valid email)
- `tenantId`: number - Associated tenant ID (optional)

### ChangePasswordDto

- `currentPassword`: string - User's current password
- `newPassword`: string - New password

### UserResponseDto

- `id`: number - Unique identifier
- `email`: string - User's email address
- `name`: string - User's full name
- `tenantId`: number - Associated tenant ID

### UserWithRolesDto

- Extends UserResponseDto
- `roles`: RoleModel[] - Array of user's roles

### UserWithTenantsDto

- Extends UserResponseDto
- `tenant`: TenantModel - Associated tenant details

### UserWithTenantsAndRolesDto

- Extends UserResponseDto
- `roles`: RoleModel[] - Array of user's roles
- `tenant`: TenantModel - Associated tenant details

## 📝 User Stories

### 1. User Registration

**As a** new user  
**I want to** create an account  
**So that** I can access the system

**Acceptance Criteria:**

- User can provide email, name, and password
- Password is securely hashed
- Email must be unique and valid
- User receives confirmation of successful registration
- User can optionally be associated with a tenant during registration

### 2. User Profile Management

**As a** registered user  
**I want to** update my profile information  
**So that** my details are current

**Acceptance Criteria:**

- User can update their name
- User can update their email
- Changes are immediately reflected
- Only authenticated users can update their own profile
- Admins can update any user's profile

### 3. Password Change

**As a** registered user  
**I want to** change my password  
**So that** I can maintain account security

**Acceptance Criteria:**

- User must provide current password
- New password must meet security requirements
- Password change requires authentication
- User receives confirmation of successful password change
- Only authenticated users can change their own password

### 4. Tenant Association

**As a** system administrator  
**I want to** assign users to tenants  
**So that** users can access tenant-specific resources

**Acceptance Criteria:**

- Admin can assign users to specific tenants
- Users can only be assigned to existing tenants
- Users can be reassigned to different tenants
- Changes are immediately reflected

### 5. Role Management

**As a** system administrator  
**I want to** assign roles to users  
**So that** users have appropriate permissions

**Acceptance Criteria:**

- Admin can assign multiple roles to a user
- Roles can be tenant-specific
- Role changes are immediately effective
- Users can have different roles for different tenants
- Only admins can modify role assignments

## 🔒 Security Considerations

- All endpoints require authentication
- Password changes require current password verification
- Users can only access their own resources unless they have admin/support roles
- Role-based access control is enforced at both endpoint and resource levels
- Sensitive operations (password changes, deletions) require additional verification

## 📦 Dependencies

- PasswordService: For password hashing and verification
- TenantsService: For tenant validation and management
- RolesService: For role validation and management
- AuthService: For authentication and authorization
- AuthGuard: For endpoint protection
- CheckUserAccess: For resource-level authorization
