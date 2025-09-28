import { sequelize } from '../models/index.js';
import { USER_TYPES, ADMIN_ROLES } from '../config/constants.js';

/**
 * Fetch user data from vottery_user_management table
 * @param {number|string} identifier - User ID, email, or phone
 * @returns {Promise<Object>} User data
 */
const getUserFromDatabase = async (identifier) => {
  try {
    const userQuery = `
      SELECT 
        id,
        user_id,
        sngine_email,
        sngine_phone,
        user_type,
        admin_role,
        subscription_status,
        subscription_plan,
        subscription_expires_at,
        first_name,
        last_name,
        date_of_birth,
        gender,
        country,
        city,
        timezone,
        user_age,
        user_gender,
        user_country,
        created_at,
        updated_at
      FROM vottery_user_management 
      WHERE user_id = ? OR id = ? OR sngine_email = ? OR sngine_phone = ?
      LIMIT 1
    `;

    const users = await sequelize.query(userQuery, {
      replacements: [identifier, identifier, identifier, identifier],
      type: sequelize.QueryTypes.SELECT
    });

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
};

/**
 * Validate subscription status and expiration
 * @param {Object} user - User object
 * @returns {boolean} True if subscription is valid
 */
const isSubscriptionValid = (user) => {
  if (!user.subscription_status || user.subscription_status !== 'active') {
    return false;
  }

  // Check expiration date if present
  if (user.subscription_expires_at) {
    const expirationDate = new Date(user.subscription_expires_at);
    const now = new Date();
    return expirationDate > now;
  }

  return true;
};

// Simple role-based authentication middleware (no API gateway)
export const roleAuth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // For testing/development - get user identifier from request body, params, or headers
      const userIdentifier = req.body.user_id || 
                            req.body.user_email || 
                            req.body.user_phone || 
                            req.params.userId || 
                            req.headers['x-user-id'] || 
                            req.headers['x-user-email'] ||
                            req.headers['x-user-phone'];

      if (!userIdentifier) {
        return res.status(401).json({
          success: false,
          message: 'User identifier required (user_id, email, or phone)'
        });
      }

      // Fetch user data from database
      const user = await getUserFromDatabase(userIdentifier);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found in system'
        });
      }

      // Determine user's primary role
      const userRole = user.admin_role || user.user_type;
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'User role not defined'
        });
      }

      // If no specific roles required, allow any authenticated user
      if (allowedRoles.length === 0) {
        req.user = user;
        return next();
      }

      // Check if user has admin role
      if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
        // Check specific admin role permissions
        if (allowedRoles.includes(user.admin_role)) {
          req.user = user;
          return next();
        }

        // Admin hierarchy check
        const adminHierarchy = {
          [ADMIN_ROLES.MANAGER]: 10,
          [ADMIN_ROLES.ADMIN]: 9,
          [ADMIN_ROLES.MODERATOR]: 8,
          [ADMIN_ROLES.AUDITOR]: 7,
          [ADMIN_ROLES.ANALYST]: 6,
          [ADMIN_ROLES.EDITOR]: 5,
          [ADMIN_ROLES.SPONSOR]: 4,
          [ADMIN_ROLES.ADVERTISER]: 3
        };

        const userLevel = adminHierarchy[user.admin_role] || 0;
        
        // Manager and Admin have access to most operations
        if (userLevel >= 9) {
          req.user = user;
          return next();
        }

        // Moderator has access to content management operations
        if (userLevel >= 8 && allowedRoles.some(role => 
          [USER_TYPES.INDIVIDUAL_FREE, USER_TYPES.INDIVIDUAL_SUBSCRIBED, 
           USER_TYPES.ORGANIZATION_FREE, USER_TYPES.ORGANIZATION_SUBSCRIBED].includes(role)
        )) {
          req.user = user;
          return next();
        }

        // Auditor has access to security and audit operations
        if (userLevel >= 7 && allowedRoles.includes('auditor_access')) {
          req.user = user;
          return next();
        }

        // Editor has access to content editing operations
        if (userLevel >= 5 && allowedRoles.includes('editor_access')) {
          req.user = user;
          return next();
        }
      }

      // Check user type permissions
      if (user.user_type && allowedRoles.includes(user.user_type)) {
        // Additional checks for subscription-based features
        if (user.user_type === USER_TYPES.INDIVIDUAL_SUBSCRIBED || 
            user.user_type === USER_TYPES.ORGANIZATION_SUBSCRIBED) {
          
          if (!isSubscriptionValid(user)) {
            return res.status(403).json({
              success: false,
              message: 'Active subscription required',
              subscription_status: user.subscription_status,
              subscription_expires_at: user.subscription_expires_at
            });
          }
        }

        req.user = user;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required_roles: allowedRoles,
        user_role: userRole
      });

    } catch (error) {
      console.error('Role auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Subscription check middleware
export const requireSubscription = async (req, res, next) => {
  try {
    const userIdentifier = req.body.user_id || 
                          req.body.user_email || 
                          req.body.user_phone || 
                          req.params.userId || 
                          req.headers['x-user-id'] || 
                          req.headers['x-user-email'] ||
                          req.headers['x-user-phone'];

    if (!userIdentifier) {
      return res.status(401).json({
        success: false,
        message: 'User identifier required'
      });
    }

    // Fetch fresh user data if not already available
    let user = req.user;
    if (!user || !user.subscription_status) {
      user = await getUserFromDatabase(userIdentifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Admin roles bypass subscription requirements
    if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
      req.user = user;
      return next();
    }

    // Check if user has active subscription
    if (user.user_type === USER_TYPES.INDIVIDUAL_SUBSCRIBED || 
        user.user_type === USER_TYPES.ORGANIZATION_SUBSCRIBED) {
      
      if (!isSubscriptionValid(user)) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required for this feature',
          subscription_status: user.subscription_status,
          subscription_plan: user.subscription_plan,
          subscription_expires_at: user.subscription_expires_at
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Subscription required for this feature. Please upgrade your account.',
        current_user_type: user.user_type
      });
    }

    req.user = user;
    return next();

  } catch (error) {
    console.error('Subscription middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Subscription validation error'
    });
  }
};

// Content creator specific middleware
export const requireContentCreator = async (req, res, next) => {
  try {
    const userIdentifier = req.body.user_id || 
                          req.body.user_email || 
                          req.body.user_phone || 
                          req.params.userId || 
                          req.headers['x-user-id'] || 
                          req.headers['x-user-email'] ||
                          req.headers['x-user-phone'];

    if (!userIdentifier) {
      return res.status(401).json({
        success: false,
        message: 'User identifier required'
      });
    }

    // Fetch fresh user data if not already available
    let user = req.user;
    if (!user || !user.subscription_status) {
      user = await getUserFromDatabase(userIdentifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Admin roles have content creator access
    if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
      req.user = user;
      return next();
    }

    // Check if user has content creator features enabled (requires subscription)
    if (user.user_type !== USER_TYPES.INDIVIDUAL_SUBSCRIBED && 
        user.user_type !== USER_TYPES.ORGANIZATION_SUBSCRIBED) {
      return res.status(403).json({
        success: false,
        message: 'Content creator features require subscription',
        current_user_type: user.user_type
      });
    }

    // Validate subscription
    if (!isSubscriptionValid(user)) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required for content creator features',
        subscription_status: user.subscription_status,
        subscription_expires_at: user.subscription_expires_at
      });
    }

    req.user = user;
    return next();

  } catch (error) {
    console.error('Content creator middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Content creator validation error'
    });
  }
};

// Check election ownership middleware
export const checkElectionOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const electionId = req.params.id || req.params.electionId;

    if (!userId || !electionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Election ID are required'
      });
    }

    // Admin roles have access to all elections
    if (req.user.admin_role && 
        [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR].includes(req.user.admin_role)) {
      return next();
    }

    // Check if user owns the election
    const electionQuery = `
      SELECT creator_id 
      FROM vottery_election_2_elections 
      WHERE id = ? AND creator_id = ?
      LIMIT 1
    `;

    const elections = await sequelize.query(electionQuery, {
      replacements: [electionId, userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (elections.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this election'
      });
    }

    return next();

  } catch (error) {
    console.error('Election ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Election ownership validation error'
    });
  }
};

// Simple user validation middleware
export const validateUser = async (req, res, next) => {
  try {
    const userIdentifier = req.body.user_id || 
                          req.body.user_email || 
                          req.body.user_phone || 
                          req.params.userId || 
                          req.headers['x-user-id'] || 
                          req.headers['x-user-email'] ||
                          req.headers['x-user-phone'];

    if (!userIdentifier) {
      return res.status(401).json({
        success: false,
        message: 'User identifier required (user_id, email, or phone)'
      });
    }

    const user = await getUserFromDatabase(userIdentifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in system'
      });
    }

    req.user = user;
    return next();

  } catch (error) {
    console.error('User validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'User validation error'
    });
  }
};

export default {
  roleAuth,
  requireSubscription,
  requireContentCreator,
  checkElectionOwnership,
  validateUser,
  getUserFromDatabase,
  isSubscriptionValid
};
// import { sequelize } from '../models/index.js';
// import { USER_TYPES, ADMIN_ROLES } from '../config/constants.js';

// /**
//  * Fetch user data from vottery_user_management table
//  * @param {number} userId - User ID from API gateway
//  * @returns {Promise<Object>} User data
//  */
// const getUserFromDatabase = async (userId) => {
//   try {
//     const userQuery = `
//       SELECT 
//         id,
//         user_id,
//         sngine_email,
//         sngine_phone,
//         user_type,
//         admin_role,
//         subscription_status,
//         subscription_plan,
//         subscription_expires_at,
//         first_name,
//         last_name,
//         date_of_birth,
//         gender,
//         country,
//         city,
//         timezone,
//         user_age,
//         user_gender,
//         user_country,
//         created_at,
//         updated_at
//       FROM vottery_user_management 
//       WHERE user_id = ? OR id = ?
//       LIMIT 1
//     `;

//     const users = await sequelize.query(userQuery, {
//       replacements: [userId, userId],
//       type: sequelize.QueryTypes.SELECT
//     });

//     return users.length > 0 ? users[0] : null;
//   } catch (error) {
//     console.error('Error fetching user from database:', error);
//     return null;
//   }
// };

// /**
//  * Validate subscription status and expiration
//  * @param {Object} user - User object
//  * @returns {boolean} True if subscription is valid
//  */
// const isSubscriptionValid = (user) => {
//   if (!user.subscription_status || user.subscription_status !== 'active') {
//     return false;
//   }

//   // Check expiration date if present
//   if (user.subscription_expires_at) {
//     const expirationDate = new Date(user.subscription_expires_at);
//     const now = new Date();
//     return expirationDate > now;
//   }

//   return true;
// };

// // Role-based authentication middleware
// export const roleAuth = (allowedRoles = []) => {
//   return async (req, res, next) => {
//     try {
//       // Extract user ID from API gateway (assuming it's in req.user.id or req.userId)
//       const userId = req.user?.id || req.user?.user_id || req.userId || req.headers['x-user-id'];

//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required - User ID not provided'
//         });
//       }

//       // Fetch user data from database
//       const user = await getUserFromDatabase(userId);

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found in system'
//         });
//       }

//       // Determine user's primary role
//       const userRole = user.admin_role || user.user_type;
      
//       if (!userRole) {
//         return res.status(403).json({
//           success: false,
//           message: 'User role not defined'
//         });
//       }

//       // Check if user has admin role
//       if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
//         // Check specific admin role permissions
//         if (allowedRoles.length === 0 || allowedRoles.includes(user.admin_role)) {
//           req.user = user;
//           return next();
//         }

//         // Admin hierarchy check
//         const adminHierarchy = {
//           [ADMIN_ROLES.MANAGER]: 10,
//           [ADMIN_ROLES.ADMIN]: 9,
//           [ADMIN_ROLES.MODERATOR]: 8,
//           [ADMIN_ROLES.AUDITOR]: 7,
//           [ADMIN_ROLES.ANALYST]: 6,
//           [ADMIN_ROLES.EDITOR]: 5,
//           [ADMIN_ROLES.SPONSOR]: 4,
//           [ADMIN_ROLES.ADVERTISER]: 3
//         };

//         const userLevel = adminHierarchy[user.admin_role] || 0;
        
//         // Manager and Admin have access to most operations
//         if (userLevel >= 9) {
//           req.user = user;
//           return next();
//         }

//         // Moderator has access to content management operations
//         if (userLevel >= 8 && allowedRoles.some(role => 
//           [USER_TYPES.INDIVIDUAL_FREE, USER_TYPES.INDIVIDUAL_SUBSCRIBED, 
//            USER_TYPES.ORGANIZATION_FREE, USER_TYPES.ORGANIZATION_SUBSCRIBED].includes(role)
//         )) {
//           req.user = user;
//           return next();
//         }

//         // Auditor has access to security and audit operations
//         if (userLevel >= 7 && allowedRoles.includes('auditor_access')) {
//           req.user = user;
//           return next();
//         }

//         // Editor has access to content editing operations
//         if (userLevel >= 5 && allowedRoles.includes('editor_access')) {
//           req.user = user;
//           return next();
//         }
//       }

//       // Check user type permissions
//       if (user.user_type && (allowedRoles.length === 0 || allowedRoles.includes(user.user_type))) {
//         // Additional checks for subscription-based features
//         if (user.user_type === USER_TYPES.INDIVIDUAL_SUBSCRIBED || 
//             user.user_type === USER_TYPES.ORGANIZATION_SUBSCRIBED) {
          
//           if (!isSubscriptionValid(user)) {
//             return res.status(403).json({
//               success: false,
//               message: 'Active subscription required',
//               subscription_status: user.subscription_status,
//               subscription_expires_at: user.subscription_expires_at
//             });
//           }
//         }

//         req.user = user;
//         return next();
//       }

//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions',
//         required_roles: allowedRoles,
//         user_role: userRole
//       });

//     } catch (error) {
//       console.error('Role auth middleware error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Authorization error'
//       });
//     }
//   };
// };

// // Subscription check middleware
// export const requireSubscription = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.user?.user_id || req.userId || req.headers['x-user-id'];

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Fetch fresh user data if not already available
//     let user = req.user;
//     if (!user || !user.subscription_status) {
//       user = await getUserFromDatabase(userId);
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found'
//         });
//       }
//     }

//     // Admin roles bypass subscription requirements
//     if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
//       req.user = user;
//       return next();
//     }

//     // Check if user has active subscription
//     if (user.user_type === USER_TYPES.INDIVIDUAL_SUBSCRIBED || 
//         user.user_type === USER_TYPES.ORGANIZATION_SUBSCRIBED) {
      
//       if (!isSubscriptionValid(user)) {
//         return res.status(403).json({
//           success: false,
//           message: 'Active subscription required for this feature',
//           subscription_status: user.subscription_status,
//           subscription_plan: user.subscription_plan,
//           subscription_expires_at: user.subscription_expires_at
//         });
//       }
//     } else {
//       return res.status(403).json({
//         success: false,
//         message: 'Subscription required for this feature. Please upgrade your account.',
//         current_user_type: user.user_type
//       });
//     }

//     req.user = user;
//     return next();

//   } catch (error) {
//     console.error('Subscription middleware error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Subscription validation error'
//     });
//   }
// };

// // Content creator specific middleware
// export const requireContentCreator = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.user?.user_id || req.userId || req.headers['x-user-id'];

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Fetch fresh user data if not already available
//     let user = req.user;
//     if (!user || !user.subscription_status) {
//       user = await getUserFromDatabase(userId);
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found'
//         });
//       }
//     }

//     // Admin roles have content creator access
//     if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
//       req.user = user;
//       return next();
//     }

//     // Check if user has content creator features enabled (requires subscription)
//     if (user.user_type !== USER_TYPES.INDIVIDUAL_SUBSCRIBED && 
//         user.user_type !== USER_TYPES.ORGANIZATION_SUBSCRIBED) {
//       return res.status(403).json({
//         success: false,
//         message: 'Content creator features require subscription',
//         current_user_type: user.user_type
//       });
//     }

//     // Validate subscription
//     if (!isSubscriptionValid(user)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Active subscription required for content creator features',
//         subscription_status: user.subscription_status,
//         subscription_expires_at: user.subscription_expires_at
//       });
//     }

//     req.user = user;
//     return next();

//   } catch (error) {
//     console.error('Content creator middleware error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Content creator validation error'
//     });
//   }
// };

// // Check election ownership middleware
// export const checkElectionOwnership = async (req, res, next) => {
//   try {
//     const userId = req.user?.user_id || req.user?.id;
//     const electionId = req.params.id || req.params.electionId;

//     if (!userId || !electionId) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID and Election ID are required'
//       });
//     }

//     // Admin roles have access to all elections
//     if (req.user.admin_role && 
//         [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR].includes(req.user.admin_role)) {
//       return next();
//     }

//     // Check if user owns the election
//     const electionQuery = `
//       SELECT creator_id 
//       FROM vottery_election_2_elections 
//       WHERE id = ? AND creator_id = ?
//       LIMIT 1
//     `;

//     const elections = await sequelize.query(electionQuery, {
//       replacements: [electionId, userId],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (elections.length === 0) {
//       return res.status(403).json({
//         success: false,
//         message: 'You do not have permission to access this election'
//       });
//     }

//     return next();

//   } catch (error) {
//     console.error('Election ownership check error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Election ownership validation error'
//     });
//   }
// };

// // Validate user existence middleware
// export const validateUser = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.user?.user_id || req.userId || req.headers['x-user-id'];

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User authentication required'
//       });
//     }

//     const user = await getUserFromDatabase(userId);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found in system'
//       });
//     }

//     req.user = user;
//     return next();

//   } catch (error) {
//     console.error('User validation error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'User validation error'
//     });
//   }
// };

// export default {
//   roleAuth,
//   requireSubscription,
//   requireContentCreator,
//   checkElectionOwnership,
//   validateUser,
//   getUserFromDatabase,
//   isSubscriptionValid
// };
// import { USER_TYPES, ADMIN_ROLES } from '../config/constants.js';

// // Role-based authentication middleware
// export const roleAuth = (allowedRoles = []) => {
//   return (req, res, next) => {
//     try {
//       // In a real implementation, you would extract user from JWT token
//       // For now, we assume user is passed from API gateway
//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required'
//         });
//       }

//       // Check if user has required role
//       const userRole = user.admin_role || user.user_type;
      
//       if (!userRole) {
//         return res.status(403).json({
//           success: false,
//           message: 'User role not defined'
//         });
//       }

//       // Allow if user has admin role
//       if (user.admin_role && Object.values(ADMIN_ROLES).includes(user.admin_role)) {
//         // Check specific admin role permissions
//         if (allowedRoles.includes(user.admin_role)) {
//           req.user = user;
//           return next();
//         }
//       }

//       // Check user type permissions
//       if (user.user_type && allowedRoles.includes(user.user_type)) {
//         // Additional checks for subscription-based features
//         if (user.user_type.includes('subscribed')) {
//           if (user.subscription_status !== 'active') {
//             return res.status(403).json({
//               success: false,
//               message: 'Active subscription required'
//             });
//           }
//         }

//         req.user = user;
//         return next();
//       }

//       // Check if admin roles have broader permissions
//       if (user.admin_role) {
//         const adminHierarchy = {
//           [ADMIN_ROLES.MANAGER]: 10,
//           [ADMIN_ROLES.ADMIN]: 9,
//           [ADMIN_ROLES.MODERATOR]: 8,
//           [ADMIN_ROLES.AUDITOR]: 7,
//           [ADMIN_ROLES.ANALYST]: 6,
//           [ADMIN_ROLES.EDITOR]: 5,
//           [ADMIN_ROLES.SPONSOR]: 4,
//           [ADMIN_ROLES.ADVERTISER]: 3
//         };

//         const userLevel = adminHierarchy[user.admin_role] || 0;
        
//         // Manager and Admin have access to most operations
//         if (userLevel >= 9) {
//           req.user = user;
//           return next();
//         }

//         // Moderator has access to content management
//         if (userLevel >= 8 && allowedRoles.some(role => 
//           ['individual_free', 'individual_subscribed', 'organization_free', 'organization_subscribed'].includes(role)
//         )) {
//           req.user = user;
//           return next();
//         }
//       }

//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions'
//       });

//     } catch (error) {
//       console.error('Role auth middleware error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Authorization error'
//       });
//     }
//   };
// };

// // Subscription check middleware
// export const requireSubscription = (req, res, next) => {
//   const user = req.user;

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: 'Authentication required'
//     });
//   }

//   // Admin roles bypass subscription requirements
//   if (user.admin_role) {
//     return next();
//   }

//   // Check if user has active subscription
//   if (user.user_type && user.user_type.includes('subscribed')) {
//     if (user.subscription_status !== 'active') {
//       return res.status(403).json({
//         success: false,
//         message: 'Active subscription required for this feature'
//       });
//     }
//   } else {
//     return res.status(403).json({
//       success: false,
//       message: 'Subscription required for this feature'
//     });
//   }

//   return next();
// };

// // Content creator specific middleware
// export const requireContentCreator = (req, res, next) => {
//   const user = req.user;

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: 'Authentication required'
//     });
//   }

//   // Check if user has content creator features enabled
//   if (!user.user_type || !user.user_type.includes('subscribed')) {
//     return res.status(403).json({
//       success: false,
//       message: 'Content creator features require subscription'
//     });
//   }

//   return next();
// };

// export default {
//   roleAuth,
//   requireSubscription,
//   requireContentCreator
// };
// import { USER_TYPES, ADMIN_ROLES, SUBSCRIPTION_STATUS, ERROR_MESSAGES } from '../config/constants.js';
// import { query } from '../config/database.js';

// // Role-based authentication middleware
// export const roleAuth = (allowedRoles = []) => {
//   return async (req, res, next) => {
//     try {
//       // Get user info from headers (set by API Gateway)
//       const userId = req.headers['x-user-id'];
//       const userRole = req.headers['x-user-role'];
//       const userType = req.headers['x-user-type'];

//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required',
//           code: 'UNAUTHORIZED'
//         });
//       }

//       // Fetch user details from database
//       const userQuery = `
//         SELECT id, user_type, admin_role, subscription_status, subscription_plan,
//                subscription_expires_at, sngine_email, first_name, last_name
//         FROM vottery_user_management
//         WHERE id = $1
//       `;

//       const userResult = await query(userQuery, [userId]);
//       const user = userResult.rows[0];

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found',
//           code: 'UNAUTHORIZED'
//         });
//       }

//       // Check if 'all' is in allowed roles (open access)
//       if (allowedRoles.includes('all')) {
//         req.user = user;
//         return next();
//       }

//       // Check admin roles first (highest priority)
//       if (user.admin_role && allowedRoles.includes(user.admin_role)) {
//         req.user = user;
//         return next();
//       }

//       // Check user type permissions
//       const hasUserTypeAccess = allowedRoles.some(role => {
//         switch (role) {
//           case 'individual_free':
//             return user.user_type === USER_TYPES.INDIVIDUAL_FREE;

//           case 'individual_subscribed':
//             return (
//               user.user_type === USER_TYPES.INDIVIDUAL_SUBSCRIBED ||
//               (user.user_type === USER_TYPES.INDIVIDUAL_FREE && user.subscription_status === SUBSCRIPTION_STATUS.ACTIVE)
//             );

//           case 'organization_free':
//             return user.user_type === USER_TYPES.ORGANIZATION_FREE;

//           case 'organization_subscribed':
//             return (
//               user.user_type === USER_TYPES.ORGANIZATION_SUBSCRIBED ||
//               (user.user_type === USER_TYPES.ORGANIZATION_FREE && user.subscription_status === SUBSCRIPTION_STATUS.ACTIVE)
//             );

//           case 'content_creator':
//             return user.user_type === USER_TYPES.CONTENT_CREATOR;

//           case 'voter':
//             return user.user_type === USER_TYPES.VOTER;

//           case 'subscribed':
//             return user.subscription_status === SUBSCRIPTION_STATUS.ACTIVE;

//           case 'free':
//             return user.subscription_status !== SUBSCRIPTION_STATUS.ACTIVE;

//           default:
//             return false;
//         }
//       });

//       if (!hasUserTypeAccess) {
//         return res.status(403).json({
//           success: false,
//           message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
//           code: 'FORBIDDEN',
//           required_roles: allowedRoles,
//           user_type: user.user_type,
//           admin_role: user.admin_role,
//           subscription_status: user.subscription_status
//         });
//       }

//       // Attach user to request
//       req.user = user;
//       next();

//     } catch (error) {
//       console.error('Role auth middleware error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Authentication error',
//         code: 'AUTH_ERROR'
//       });
//     }
//   };
// };

// // Check if user can create elections
// export const canCreateElection = async (req, res, next) => {
//   try {
//     const { user } = req;

//     // Admin roles can always create
//     if (user.admin_role) {
//       return next();
//     }

//     // Subscribed users can create unlimited elections
//     if (user.subscription_status === SUBSCRIPTION_STATUS.ACTIVE) {
//       return next();
//     }

//     // Check free tier limits
//     const countQuery = `
//       SELECT COUNT(*) as election_count
//       FROM vottery_elections_2
//       WHERE creator_id = $1 AND deleted_at IS NULL
//     `;

//     const countResult = await query(countQuery, [user.id]);
//     const electionCount = parseInt(countResult.rows[0].election_count);
//     const maxFreeElections = 3; // From constants

//     if (electionCount >= maxFreeElections) {
//       return res.status(403).json({
//         success: false,
//         message: ERROR_MESSAGES.SUBSCRIPTION_REQUIRED,
//         code: 'SUBSCRIPTION_REQUIRED',
//         current_count: electionCount,
//         max_free_elections: maxFreeElections
//       });
//     }

//     next();
//   } catch (error) {
//     console.error('Can create election check error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Permission check error',
//       code: 'PERMISSION_ERROR'
//     });
//   }
// };

// // Check if user owns the resource
// export const resourceOwnership = (resourceType = 'election') => {
//   return async (req, res, next) => {
//     try {
//       const { user } = req;
//       const resourceId = req.params.electionId || req.params.questionId || req.params.id;

//       // Admin roles can access any resource
//       if (user.admin_role && ['manager', 'admin', 'moderator'].includes(user.admin_role)) {
//         return next();
//       }

//       let ownershipQuery;
//       let params = [resourceId, user.id];

//       switch (resourceType) {
//         case 'election':
//           ownershipQuery = `
//             SELECT creator_id FROM vottery_elections_2 
//             WHERE id = $1 AND creator_id = $2 AND deleted_at IS NULL
//           `;
//           break;

//         case 'question':
//           ownershipQuery = `
//             SELECT e.creator_id FROM vottery_questions_2 q
//             JOIN vottery_elections_2 e ON q.election_id = e.id
//             WHERE q.id = $1 AND e.creator_id = $2 AND e.deleted_at IS NULL
//           `;
//           break;

//         default:
//           return res.status(400).json({
//             success: false,
//             message: 'Invalid resource type',
//             code: 'INVALID_RESOURCE'
//           });
//       }

//       const result = await query(ownershipQuery, params);

//       if (result.rows.length === 0) {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied: You do not own this resource',
//           code: 'RESOURCE_OWNERSHIP_DENIED'
//         });
//       }

//       next();
//     } catch (error) {
//       console.error('Resource ownership check error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Ownership check error',
//         code: 'OWNERSHIP_ERROR'
//       });
//     }
//   };
// };

// // Check subscription status
// export const subscriptionRequired = (features = []) => {
//   return (req, res, next) => {
//     const { user } = req;

//     // Admin roles bypass subscription checks
//     if (user.admin_role) {
//       return next();
//     }

//     // Check if subscription is active
//     if (user.subscription_status !== SUBSCRIPTION_STATUS.ACTIVE) {
//       return res.status(403).json({
//         success: false,
//         message: ERROR_MESSAGES.SUBSCRIPTION_REQUIRED,
//         code: 'SUBSCRIPTION_REQUIRED',
//         required_features: features,
//         subscription_status: user.subscription_status
//       });
//     }

//     // Check subscription expiry
//     if (user.subscription_expires_at) {
//       const expiryDate = new Date(user.subscription_expires_at);
//       const now = new Date();

//       if (expiryDate < now) {
//         return res.status(403).json({
//           success: false,
//           message: 'Subscription has expired',
//           code: 'SUBSCRIPTION_EXPIRED',
//           expired_at: user.subscription_expires_at
//         });
//       }
//     }

//     next();
//   };
// };

// // Content creator specific auth
// export const contentCreatorAuth = async (req, res, next) => {
//   try {
//     const { user } = req;

//     // Check if user is content creator or has admin role
//     if (user.admin_role || user.user_type === USER_TYPES.CONTENT_CREATOR) {
//       return next();
//     }

//     // Check if subscribed user with content creator features
//     if (user.subscription_status === SUBSCRIPTION_STATUS.ACTIVE) {
//       // Additional checks can be added here for content creator features
//       return next();
//     }

//     res.status(403).json({
//       success: false,
//       message: 'Content creator access required',
//       code: 'CONTENT_CREATOR_REQUIRED'
//     });
//   } catch (error) {
//     console.error('Content creator auth error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Content creator auth error',
//       code: 'CONTENT_CREATOR_AUTH_ERROR'
//     });
//   }
// };

// // Rate limiting per user role
// export const roleBasedRateLimit = () => {
//   const limits = {
//     [ADMIN_ROLES.MANAGER]: 10000,
//     [ADMIN_ROLES.ADMIN]: 5000,
//     [ADMIN_ROLES.MODERATOR]: 2000,
//     [USER_TYPES.INDIVIDUAL_SUBSCRIBED]: 1000,
//     [USER_TYPES.ORGANIZATION_SUBSCRIBED]: 2000,
//     [USER_TYPES.CONTENT_CREATOR]: 1500,
//     default: 100
//   };

//   return (req, res, next) => {
//     const { user } = req;
//     const userLimit = user.admin_role ? limits[user.admin_role] : limits[user.user_type] || limits.default;
    
//     // This would integrate with a rate limiting service (Redis, etc.)
//     // For now, just pass through
//     req.rateLimit = userLimit;
//     next();
//   };
// };

// export default {
//   roleAuth,
//   canCreateElection,
//   resourceOwnership,
//   subscriptionRequired,
//   contentCreatorAuth,
//   roleBasedRateLimit
// };